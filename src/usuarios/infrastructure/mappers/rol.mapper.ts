import { Rol } from '../../domain/entities/rol.entity';
import { RolEntity } from '../entities/rol.entity';

export class RolMapper {
  static toDomain(entity: RolEntity): Rol {
    return new Rol({
      id_rol: entity.id_rol,
      nombre: entity.nombre,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(domain: Rol): RolEntity {
    const entity = new RolEntity();
    if (domain.id_rol) {
      entity.id_rol = domain.id_rol;
    }
    entity.nombre = domain.nombre;
    return entity;
  }
}
