import { Area } from '../../domain/entities/area.entity';
import { AreaEntity } from '../entities/area.entity';

export class AreaMapper {
  static toDomain(entity: AreaEntity): Area {
    return new Area({
      id_area: entity.id_area,
      nombre_area: entity.nombre_area,
      contacto: entity.contacto,
      telefono: entity.telefono,
      correo: entity.correo,
      is_active: entity.is_active,
      id_sucursal: entity.id_sucursal,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: Area): AreaEntity {
    const entity = new AreaEntity();
    if (domain.id_area) {
      entity.id_area = domain.id_area;
    }
    entity.nombre_area = domain.nombre_area;
    entity.contacto = domain.contacto;
    entity.telefono = domain.telefono;
    entity.correo = domain.correo;
    entity.is_active = domain.is_active;
    entity.id_sucursal = domain.id_sucursal;
    return entity;
  }
}
