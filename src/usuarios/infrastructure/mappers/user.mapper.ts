import { User } from '../../domain/entities/user.entity';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  // Transforma del Dominio a la Base de Datos
  static toPersistence(domainUser: User): UserEntity {
    const entity = new UserEntity();

    // Si el id ya existe (ej. actualización), lo asignamos
    if (domainUser.id_usuario !== null) {
      entity.id_usuario = domainUser.id_usuario;
    }

    entity.nombre = domainUser.nombre;
    entity.apellido = domainUser.apellido;
    entity.correo = domainUser.correo;
    entity.password = domainUser.password;
    entity.telefono = domainUser.telefono;
    entity.is_active = domainUser.is_active;
    entity.id_rol = domainUser.id_rol;
    entity.id_cliente = domainUser.id_cliente;
    entity.id_sucursal = domainUser.id_sucursal;
    entity.id_area = domainUser.id_area;
    return entity;
  }

  // Transforma de la Base de Datos al Dominio
  static toDomain(entity: UserEntity): User {
    return new User(
      entity.id_usuario, // Aquí la BD ya le asignó su number autoincremental
      entity.nombre,
      entity.apellido,
      entity.correo,
      entity.password,
      entity.telefono,
      entity.is_active,
      entity.id_rol,
      entity.id_cliente,
      entity.id_sucursal,
      entity.id_area,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
