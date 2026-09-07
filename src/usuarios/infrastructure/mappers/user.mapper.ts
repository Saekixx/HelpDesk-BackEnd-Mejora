import { User } from '../../domain/entities/user.entity';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return new User({
      id_usuario: entity.id_usuario,
      nombre: entity.nombre,
      apellido: entity.apellido,
      correo: entity.correo,
      password: entity.password,
      telefono: entity.telefono,
      is_active: entity.is_active,
      id_rol: entity.id_rol,
      id_cliente: entity.id_cliente ?? null,
      id_sucursal: entity.id_sucursal ?? null,
      id_area: entity.id_area ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    if (domain.id_usuario) {
      entity.id_usuario = domain.id_usuario;
    }
    entity.nombre = domain.nombre;
    entity.apellido = domain.apellido;
    entity.correo = domain.correo;
    entity.password = domain.password;
    entity.telefono = domain.telefono;
    entity.is_active = domain.is_active;
    entity.id_rol = domain.id_rol;
    entity.id_cliente = domain.id_cliente;
    entity.id_sucursal = domain.id_sucursal;
    entity.id_area = domain.id_area;
    return entity;
  }
}
