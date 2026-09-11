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
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
} from '@/usuarios/domain/exceptions/user.exceptions';
import { SendResetPasswordEmailUseCase } from '@/mail/application/send-reset-password-email.use-case';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendResetPasswordEmailUseCase: SendResetPasswordEmailUseCase,
  ) {}

  async execute(
    id: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    // Validar si el usuario existe
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) throw new UserNotFoundException();

    // Si cambia el correo, validar disponibilidad
    if (dto.correo && dto.correo !== currentUser.correo) {
      const emailUser = await this.userRepository.findByCorreo(dto.correo);
      if (emailUser && emailUser.id_usuario !== id)
        throw new EmailAlreadyInUseException();
    }

    // Validar si el rol existe
    const targetRolId = dto.id_rol ?? currentUser.id_rol;
    const existingRol = await this.rolRepository.findById(targetRolId);
    if (!existingRol)
      throw new ConflictException('El rol especificado no existe');

    // Normalizar datos de relaciones
    const targetClienteId =
      dto.id_cliente !== undefined ? dto.id_cliente : currentUser.id_cliente;
    const targetSucursalId =
      dto.id_sucursal !== undefined ? dto.id_sucursal : currentUser.id_sucursal;
    const targetAreaId =
      dto.id_area !== undefined ? dto.id_area : currentUser.id_area;

    let finalIdCliente: number | null = null;
    let finalIdSucursal: number | null = null;
    let finalIdArea: number | null = null;

    const rolNombre = existingRol.nombre.toUpperCase();

    switch (rolNombre) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_INSITU':
      case 'SOPORTE_REMOTO':
      case 'SOPORTE_TECNICO':
        break;

      case 'CLIENTE_EMPRESA':
        if (!targetClienteId) {
          throw new BadRequestException(
            'El rol CLIENTE_EMPRESA requiere seleccionar un cliente/empresa',
          );
        }
        finalIdCliente = targetClienteId;
        break;

      case 'CLIENTE_SUCURSAL':
        if (!targetClienteId || !targetSucursalId) {
          throw new BadRequestException(
            'El rol CLIENTE_SUCURSAL requiere cliente/empresa y sucursal',
          );
        }
        finalIdCliente = targetClienteId;
        finalIdSucursal = targetSucursalId;
        break;

      case 'CLIENTE_TRABAJADOR':
        if (!targetClienteId || !targetSucursalId || !targetAreaId) {
          throw new BadRequestException(
            'El rol CLIENTE_TRABAJADOR requiere cliente/empresa, sucursal y área',
          );
        }
        finalIdCliente = targetClienteId;
        finalIdSucursal = targetSucursalId;
        finalIdArea = targetAreaId;
        break;

      default:
        throw new BadRequestException(
          `El rol ${existingRol.nombre} no tiene reglas de asignación definidas`,
        );
    }

    // Restablecer contraseña y enviar correo si resetPassword es true
    let hashedPassword = currentUser.password;
    if (dto.resetPassword) {
      hashedPassword = await this.hashService.hash('123456');

      // Generar token JWT para restablecimiento
      const resetToken = this.jwtService.sign(
        { id_usuario: currentUser.id_usuario },
        {
          secret: this.configService.get<string>('JWT_RESET_SECRET'),
          expiresIn: '15m',
        },
      );

      // Enviar correo de restablecimiento de contraseña
      const targetCorreo = dto.correo ?? currentUser.correo;
      await this.sendResetPasswordEmailUseCase.execute(
        targetCorreo,
        resetToken,
      );
    }

    // Instanciar entidad con datos actualizados
    const updatedUser = new User({
      id_usuario: currentUser.id_usuario,
      nombre: dto.nombre ?? currentUser.nombre,
      apellido: dto.apellido ?? currentUser.apellido,
      correo: dto.correo ?? currentUser.correo,
      password: hashedPassword,
      telefono: dto.telefono ?? currentUser.telefono,
      is_active: currentUser.is_active,
      id_rol: targetRolId,
      id_cliente: finalIdCliente,
      id_sucursal: finalIdSucursal,
      id_area: finalIdArea,
    });

    // Guardar cambios en BD
    const savedUser = await this.userRepository.save(updatedUser);

    // Retornar omitiendo la contraseña
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
