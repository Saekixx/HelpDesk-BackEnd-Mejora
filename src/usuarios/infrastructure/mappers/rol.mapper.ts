import { Rol } from '@/usuarios/domain/entities/rol.entity';
import { RolEntity } from '../entities/rol.entity';

export class RolMapper {
  // Transforma del Dominio a la Base de Datos
  static toPersistence(domainRol: Rol): RolEntity {
    const entity = new RolEntity();

    // Si el id ya existe, lo asignamos
    if (domainRol.id_rol !== null) {
      entity.id_rol = domainRol.id_rol;
    }

    entity.nombre = domainRol.nombre;
    return entity;
  }

  // Transforma de la Base de Datos al Dominio
  static toDomain(entity: RolEntity): Rol {
    return new Rol(entity.id_rol, entity.nombre, entity.createdAt);
  }
}
