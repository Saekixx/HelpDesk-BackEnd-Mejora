import { sucursales as PrismaSucursal } from '@prisma/client';
import {
  Sucursal,
  SucursalListItem,
} from '@/clientes/domain/entities/sucursal.entity';

// Forma del resultado de Prisma cuando el findAll incluye el conteo de
// áreas y los datos del cliente (ver SucursalPrismaRepository.findAll).
type PrismaSucursalConDetalle = PrismaSucursal & {
  _count: { area: number };
  clientes: { id_cliente: number; nombre_principal: string } | null;
};

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

  // Usado únicamente por el listado paginado (GET /sucursales), donde el
  // repositorio incluye _count.area y la relación `clientes`.
  static toListItem(entity: PrismaSucursalConDetalle): SucursalListItem {
    const sucursal = SucursalMapper.toDomain(entity);
    return {
      ...sucursal,
      total_areas: entity._count.area,
      cliente: entity.clientes
        ? {
            id_cliente: entity.clientes.id_cliente,
            nombre: entity.clientes.nombre_principal,
          }
        : null,
    };
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