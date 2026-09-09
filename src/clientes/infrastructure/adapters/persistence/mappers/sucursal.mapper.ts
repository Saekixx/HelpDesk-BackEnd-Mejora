import { sucursales as PrismaSucursal } from '@prisma/client';
import { Sucursal } from '@/clientes/domain/entities/sucursal.entity';

export class SucursalMapper {
  static toDomain(entity: PrismaSucursal): Sucursal {
    return new Sucursal({
      id_sucursal: entity.id_sucursal,
      nombre_sucursal: entity.nombre_sucursal,
      encargado: entity.encargado ?? undefined,
      telefono: entity.telefono ?? undefined,
      direccion: entity.direccion ?? undefined,
      correo: entity.correo ?? undefined,
      is_active: entity.is_active ?? true,
      id_cliente: entity.id_cliente ?? 0,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Sucursal): Partial<PrismaSucursal> {
    return {
      ...(domain.id_sucursal && { id_sucursal: domain.id_sucursal }),
      nombre_sucursal: domain.nombre_sucursal,
      encargado: domain.encargado,
      telefono: domain.telefono,
      direccion: domain.direccion,
      correo: domain.correo,
      is_active: domain.is_active,
      id_cliente: domain.id_cliente,
    };
  }
}
