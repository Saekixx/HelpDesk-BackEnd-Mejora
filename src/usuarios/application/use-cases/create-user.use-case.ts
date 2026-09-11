// src/usuarios/application/use-cases/create-user.use-case.ts
import {
  Inject,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { CreateUserDto } from '../dtos/create-user.dto';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';
import { EmailAlreadyInUseException } from '@/usuarios/domain/exceptions/user.exceptions';
import { SendVerificationEmailUseCase } from '@/mail/application/send-verification-email.use-case';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
  ) {}

  async execute(dto: CreateUserDto): Promise<{ message: string }> {
    // Validar que el correo no exista en la BD
    const existingUser = await this.userRepository.findByCorreo(dto.correo);
    if (existingUser) throw new EmailAlreadyInUseException();

    // Validar si el rol existe
    const existingRol = await this.rolRepository.findById(dto.id_rol);
    if (!existingRol)
      throw new ConflictException('El rol especificado no existe');

    // Normalizar relaciones según las reglas de negocio
    let finalIdCliente: number | null = null;
    let finalIdSucursal: number | null = null;
    let finalIdArea: number | null = null;

    const rolNombre = existingRol.nombre.toUpperCase();

    switch (rolNombre) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_INSITU':
      case 'SOPORTE_REMOTO':
        break;

      case 'CLIENTE_EMPRESA':
        if (!dto.id_cliente) {
          throw new BadRequestException(
            'El rol CLIENTE_EMPRESA requiere seleccionar un cliente/empresa',
          );
        }
        finalIdCliente = dto.id_cliente;
        break;

      case 'CLIENTE_SUCURSAL':
        if (!dto.id_cliente || !dto.id_sucursal) {
          throw new BadRequestException(
            'El rol CLIENTE_SUCURSAL requiere cliente/empresa y sucursal',
          );
        }
        finalIdCliente = dto.id_cliente;
        finalIdSucursal = dto.id_sucursal;
        break;

      case 'CLIENTE_TRABAJADOR':
        if (!dto.id_cliente || !dto.id_sucursal || !dto.id_area) {
          throw new BadRequestException(
            'El rol CLIENTE_TRABAJADOR requiere cliente/empresa, sucursal y área',
          );
        }
        finalIdCliente = dto.id_cliente;
        finalIdSucursal = dto.id_sucursal;
        finalIdArea = dto.id_area;
        break;

      default:
        throw new BadRequestException(
          `El rol ${existingRol.nombre} no tiene reglas de asignación definidas`,
        );
    }

    // Firmar el payload completo dentro del JWT (Expiración de 24 horas)
    const pendingUserData = {
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      telefono: dto.telefono ?? null,
      id_rol: dto.id_rol,
      id_cliente: finalIdCliente,
      id_sucursal: finalIdSucursal,
      id_area: finalIdArea,
    };

    const emailToken = this.jwtService.sign(pendingUserData, {
      secret: this.configService.get<string>('JWT_EMAIL_SECRET'),
      expiresIn: '24h',
    });

    // Enviar correo con el enlace de confirmación
    await this.sendVerificationEmailUseCase.execute(dto.correo, emailToken);

    return {
      message: `Invitación enviada con éxito a ${dto.correo}. La cuenta se creará una vez que el usuario confirme y establezca su contraseña.`,
    };
  }
}
