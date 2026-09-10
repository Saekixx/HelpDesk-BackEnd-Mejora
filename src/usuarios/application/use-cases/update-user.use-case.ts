import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
  ) {}

  async execute(
    id: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    // Validar si el usuario existe
    const currentUser = await this.userRepository.findById(id);
    if (!currentUser) throw new UserNotFoundException();

    // Si cambia el correo, validar que no esté en uso por otro usuario
    if (dto.correo && dto.correo !== currentUser.correo) {
      const emailUser = await this.userRepository.findByCorreo(dto.correo);
      if (emailUser && emailUser.id_usuario !== id)
        throw new EmailAlreadyInUseException();
    }

    // Validar si el rol existe y obtener su nombre
    const targetRolId = dto.id_rol ?? currentUser.id_rol;
    const existingRol = await this.rolRepository.findById(targetRolId);
    if (!existingRol)
      throw new ConflictException('El rol especificado no existe');

    // Normalizar y validar relaciones según la jerarquía del rol
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

    // Validamos las relaciones según la jerarquía del rol
    switch (rolNombre) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_INSITU':
      case 'SOPORTE_REMOTO': // Dejamos este rol por si a futuro se cambia el nombre de tecnico a remoto
      case 'SOPORTE_TECNICO': // Soporte remoto actual en la db se llama soporte tecnico pero es remoto
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

    // Si se solicita reestablecer la contraseña, hasheamos la contraseña por defecto
    let hashedPassword = currentUser.password;
    if (dto.resetPassword) {
      hashedPassword = await this.hashService.hash('123456');
    }

    // Instanciamos la entidad de Dominio con los datos actualizados
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

    // Guardamos los cambios en la base de datos
    const savedUser = await this.userRepository.save(updatedUser);

    // Devolvemos el usuario actualizado sin la contraseña
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
