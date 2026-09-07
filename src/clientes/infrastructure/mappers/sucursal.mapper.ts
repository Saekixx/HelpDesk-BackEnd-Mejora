import { Sucursal } from '../../domain/entities/sucursal.entity';
import { SucursalEntity } from '../entities/sucursal.entity';

export class SucursalMapper {
  static toDomain(entity: SucursalEntity): Sucursal {
    return new Sucursal({
      id_sucursal: entity.id_sucursal,
      nombre_sucursal: entity.nombre_sucursal,
      encargado: entity.encargado,
      telefono: entity.telefono,
      direccion: entity.direccion,
      correo: entity.correo,
      is_active: entity.is_active,
      id_cliente: entity.id_cliente,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: Sucursal): SucursalEntity {
    const entity = new SucursalEntity();
    if (domain.id_sucursal) {
      entity.id_sucursal = domain.id_sucursal;
    }
    entity.nombre_sucursal = domain.nombre_sucursal;
    entity.encargado = domain.encargado;
    entity.telefono = domain.telefono;
    entity.direccion = domain.direccion;
    entity.correo = domain.correo;
    entity.is_active = domain.is_active;
    entity.id_cliente = domain.id_cliente;
    return entity;
  }
}
