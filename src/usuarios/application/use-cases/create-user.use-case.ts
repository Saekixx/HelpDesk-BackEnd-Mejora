import {
  Inject,
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';
import { EmailAlreadyInUseException } from '@/usuarios/domain/exceptions/user.exceptions';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
  ) {}

  async execute(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Validar si el correo ya está registrado
    const existingUser = await this.userRepository.findByCorreo(dto.correo);
    if (existingUser) throw new EmailAlreadyInUseException();

    // Validar si el rol existe y obtener su nombre
    const existingRol = await this.rolRepository.findById(dto.id_rol);
    if (!existingRol)
      throw new ConflictException('El rol especificado no existe');

    // Normalizar y validar relaciones según la jerarquía del rol
    let finalIdCliente: number | null = null;
    let finalIdSucursal: number | null = null;
    let finalIdArea: number | null = null;

    // Validar las relaciones según la jerarquía del rol
    const rolNombre = existingRol.nombre.toUpperCase();

    switch (rolNombre) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_INSITU':
      case 'SOPORTE_REMOTO':
        // No deben asociarse a ninguna entidad externa
        break;

      // Los roles de cliente requieren validaciones específicas (id_cliente)
      case 'CLIENTE_EMPRESA':
        if (!dto.id_cliente) {
          throw new BadRequestException(
            'El rol CLIENTE_EMPRESA requiere seleccionar un cliente/empresa',
          );
        }
        finalIdCliente = dto.id_cliente;
        break;
      // Los roles de cliente con sucursal requieren id_cliente y id_sucursal
      case 'CLIENTE_SUCURSAL':
        if (!dto.id_cliente || !dto.id_sucursal) {
          throw new BadRequestException(
            'El rol CLIENTE_SUCURSAL requiere cliente/empresa y sucursal',
          );
        }
        finalIdCliente = dto.id_cliente;
        finalIdSucursal = dto.id_sucursal;
        break;

      // Los roles de cliente con sucursal y área requieren id_cliente, id_sucursal y id_area
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

      // Si el rol no coincide con ninguno de los casos anteriores, lanzar una excepción
      default:
        throw new BadRequestException(
          `El rol ${existingRol.nombre} no tiene reglas de asignación definidas`,
        );
    }

    // Hashear la contraseña inicial (por defecto "123456") antes de guardar el usuario
    const hashedPassword = await this.hashService.hash('123456');

    // Instanciar la entidad de Dominio
    const newUser = new User({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      password: hashedPassword,
      telefono: dto.telefono,
      is_active: true,
      id_rol: dto.id_rol,
      id_cliente: finalIdCliente,
      id_sucursal: finalIdSucursal,
      id_area: finalIdArea,
    });

    // Guardar en base de datos
    const savedUser = await this.userRepository.save(newUser);

    // Retornar omitiendo la contraseña
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
