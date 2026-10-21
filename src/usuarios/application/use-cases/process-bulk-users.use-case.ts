import { randomBytes } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { SendFirstAccessEmailUseCase } from '@/mail/application/send-first-access-email.use-case';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { User } from '@/usuarios/domain/entities/user.entity';
import {
  BulkUserRow,
  MAX_BULK_ROWS,
} from '@/usuarios/domain/criteria/bulk-user-row.criteria';
import { InvalidBulkFileException } from '@/usuarios/domain/exceptions/user.exceptions';
import {
  BulkRowValidation,
  BulkUserRowValidator,
} from '../services/bulk-user-row-validator.service';
import { ProcessBulkUsersDto } from '../dtos/process-bulk-users.dto';
import {
  BulkUserProcessResultDto,
  BulkUserProcessRowDto,
  BulkUserProcessStatus,
} from '../dtos/bulk-user-process-result.dto';

const FIRST_ACCESS_TOKEN_EXPIRATION = '24h'; // igual que el enlace de invitación
const EMAIL_CONCURRENCY = 10; // correos enviados en paralelo por tanda

interface CreatableUser {
  validation: BulkRowValidation;
  user: User;
}

@Injectable()
export class ProcessBulkUsersUseCase {
  private readonly logger = new Logger(ProcessBulkUsersUseCase.name);

  constructor(
    private readonly rowValidator: BulkUserRowValidator,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendFirstAccessEmailUseCase: SendFirstAccessEmailUseCase,
  ) {}

  async execute(dto: ProcessBulkUsersDto): Promise<BulkUserProcessResultDto> {
    if (dto.usuarios.length === 0) {
      throw new InvalidBulkFileException('no se enviaron usuarios');
    }
    if (dto.usuarios.length > MAX_BULK_ROWS) {
      throw new InvalidBulkFileException(
        `se superó el máximo de ${MAX_BULK_ROWS} usuarios por carga`,
      );
    }

    // El listado viene del cliente: se vuelve a validar contra la BD antes de registrar nada
    const rows: BulkUserRow[] = dto.usuarios.map((item, index) => ({
      fila: item.fila ?? index + 1,
      nombre: (item.nombre ?? '').trim(),
      apellido: (item.apellido ?? '').trim(),
      correo: (item.correo ?? '').trim(),
      rol: (item.rol ?? '').trim(),
      empresa: (item.empresa ?? '').trim(),
      sucursal: (item.sucursal ?? '').trim(),
      area: (item.area ?? '').trim(),
      estado: (item.estado ?? '').trim(),
    }));
    const context = await this.rowValidator.buildContext(dto.idCliente, rows);
    const validations = this.rowValidator.validateRows(rows, context);

    const creatable = await this.buildUsers(
      validations.filter((v) => v.errores.length === 0),
      dto.idCliente,
    );

    // Registro atómico de todos los usuarios válidos (si algo falla no se crea ninguno)
    const savedUsers = creatable.length
      ? await this.userRepository.saveMany(creatable.map((c) => c.user))
      : [];

    // Los usuarios INACTIVOS no pueden iniciar sesión: no se les envía correo de primer acceso
    const envios = dto.enviarCredenciales
      ? await this.sendCredentials(savedUsers.filter((u) => u.is_active))
      : new Map<string, boolean>();

    const detalles = validations.map((validation) =>
      this.toRowResult(validation, dto.enviarCredenciales, envios),
    );

    const creados = detalles.filter(
      (d) => d.estado === BulkUserProcessStatus.CREADO,
    ).length;
    const enviadas = [...envios.values()].filter(Boolean).length;

    return {
      totalRecibidos: detalles.length,
      creados,
      conError: detalles.length - creados,
      enviarCredenciales: dto.enviarCredenciales,
      credencialesEnviadas: enviadas,
      credencialesFallidas: envios.size - enviadas,
      detalles,
    };
  }

  private async buildUsers(
    validations: BulkRowValidation[],
    idCliente: number,
  ): Promise<CreatableUser[]> {
    if (validations.length === 0) return [];

    // Contraseña aleatoria que nadie conoce: la cuenta queda inutilizable hasta que el
    // usuario defina la suya (correo de primer acceso o "olvidé mi contraseña").
    // Se hashea una sola vez: bcrypt por cada usuario haría el proceso innecesariamente lento.
    const password = await this.hashService.hash(
      randomBytes(32).toString('hex'),
    );

    return validations.map((validation) => ({
      validation,
      user: new User({
        nombre: validation.row.nombre,
        apellido: validation.row.apellido,
        correo: validation.row.correo.toLowerCase(),
        password,
        telefono: '',
        is_active: validation.is_active,
        id_rol: validation.id_rol as number,
        id_cliente: idCliente,
        id_sucursal: validation.id_sucursal,
        id_area: validation.id_area,
      }),
    }));
  }

  // Envía el correo de primer acceso por tandas; un fallo no revierte a los usuarios ya creados
  private async sendCredentials(users: User[]): Promise<Map<string, boolean>> {
    const resultados = new Map<string, boolean>();

    for (let i = 0; i < users.length; i += EMAIL_CONCURRENCY) {
      const tanda = users.slice(i, i + EMAIL_CONCURRENCY);
      await Promise.all(
        tanda.map(async (user) => {
          try {
            const token = this.jwtService.sign(
              { id_usuario: user.id_usuario },
              {
                secret: this.configService.get<string>('JWT_RESET_SECRET'),
                expiresIn: FIRST_ACCESS_TOKEN_EXPIRATION,
              },
            );
            await this.sendFirstAccessEmailUseCase.execute(
              user.correo,
              user.nombre,
              token,
            );
            resultados.set(user.correo, true);
          } catch (error) {
            this.logger.warn(
              `No se pudo enviar el correo de primer acceso a ${user.correo}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            resultados.set(user.correo, false);
          }
        }),
      );
    }
    return resultados;
  }

  private toRowResult(
    { row, errores, is_active }: BulkRowValidation,
    enviarCredenciales: boolean,
    envios: Map<string, boolean>,
  ): BulkUserProcessRowDto {
    const base = {
      fila: row.fila,
      nombreCompleto: `${row.nombre} ${row.apellido}`.trim(),
      correo: row.correo,
      rol: row.rol,
      sucursal: row.sucursal,
    };

    if (errores.length > 0) {
      return {
        ...base,
        estado: BulkUserProcessStatus.ERROR,
        observacion: errores.join('; '),
        credencialesEnviadas: null,
      };
    }

    if (!is_active) {
      return {
        ...base,
        estado: BulkUserProcessStatus.CREADO,
        observacion: 'Usuario creado como INACTIVO',
        credencialesEnviadas: null,
      };
    }

    const enviada = enviarCredenciales
      ? (envios.get(row.correo.toLowerCase()) ?? false)
      : null;
    return {
      ...base,
      estado: BulkUserProcessStatus.CREADO,
      observacion:
        enviada === false
          ? 'Usuario creado, pero no se pudo enviar el correo de acceso'
          : 'Usuario creado',
      credencialesEnviadas: enviada,
    };
  }
}
