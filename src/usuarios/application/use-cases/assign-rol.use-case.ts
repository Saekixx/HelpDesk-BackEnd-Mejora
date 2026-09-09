import { UserNotFoundException } from '@/usuarios/domain/exceptions/user.exceptions';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { User } from '@/usuarios/domain/entities/user.entity';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssignRolDTO } from '../dtos/assign-rol.use-case';

@Injectable()
export class AssignRolUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
  ) {}

  async execute(userId: number, dto: AssignRolDTO): Promise<string> {
    // Validar existencia del usuario
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundException();

    // Validar existencia del rol
    const rol = await this.rolRepository.findById(dto.id_rol);
    if (!rol) throw new NotFoundException('El rol especificado no existe');

    // Evaluar las relaciones según la jerarquía del rol y los datos proporcionados
    const inputCliente = dto.id_cliente ?? user.id_cliente;
    const inputSucursal = dto.id_sucursal ?? user.id_sucursal;
    const inputArea = dto.id_area ?? user.id_area;

    let finalIdCliente: number | null = null;
    let finalIdSucursal: number | null = null;
    let finalIdArea: number | null = null;

    // ToUpperCase para evitar problemas de mayúsculas/minúsculas
    const rolNombre = rol.nombre.toUpperCase();

    // Validar las relaciones según la jerarquía del rol
    switch (rolNombre) {
      case 'ADMINISTRADOR':
      case 'SOPORTE_INSITU':
      case 'SOPORTE_REMOTO':
        // Se limpian las relaciones externas si pasa a un rol administrativo
        break;

      case 'CLIENTE_EMPRESA':
        if (!inputCliente) {
          throw new BadRequestException(
            'El rol CLIENTE_EMPRESA requiere seleccionar un cliente/empresa',
          );
        }
        finalIdCliente = inputCliente;
        break;

      case 'CLIENTE_SUCURSAL':
        if (!inputCliente || !inputSucursal) {
          throw new BadRequestException(
            'El rol CLIENTE_SUCURSAL requiere cliente/empresa y sucursal',
          );
        }
        finalIdCliente = inputCliente;
        finalIdSucursal = inputSucursal;
        break;

      case 'CLIENTE_TRABAJADOR':
        if (!inputCliente || !inputSucursal || !inputArea) {
          throw new BadRequestException(
            'El rol CLIENTE_TRABAJADOR requiere cliente/empresa, sucursal y área',
          );
        }
        finalIdCliente = inputCliente;
        finalIdSucursal = inputSucursal;
        finalIdArea = inputArea;
        break;

      default:
        throw new BadRequestException(
          `El rol ${rol.nombre} no tiene reglas de asignación definidas`,
        );
    }

    // Actualizar el usuario con el nuevo rol y las relaciones correspondientes
    const updatedUser = new User({
      ...user,
      id_rol: dto.id_rol,
      id_cliente: finalIdCliente,
      id_sucursal: finalIdSucursal,
      id_area: finalIdArea,
    });

    // Guardar los cambios en el repositorio
    await this.userRepository.save(updatedUser);

    // Devolver un mensaje de éxito
    return 'Rol y asignaciones actualizados correctamente';
  }
}
