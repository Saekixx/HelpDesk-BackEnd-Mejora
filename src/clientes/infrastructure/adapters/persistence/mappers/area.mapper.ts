import { area as PrismaArea } from '@prisma/client';
import { Area, AreaListItem } from '@/clientes/domain/entities/area.entity';

// Forma del resultado de Prisma cuando el findAll incluye la sucursal y,
// anidado dentro de ella, el cliente (ver AreaPrismaRepository.findAll).
type PrismaAreaConDetalle = PrismaArea & {
  sucursales: {
    id_sucursal: number;
    nombre_sucursal: string;
    clientes: { id_cliente: number; nombre_principal: string } | null;
  } | null;
};

export class AreaMapper {
  static toDomain(entity: PrismaArea): Area {
    return new Area({
      id_area: entity.id_area,
      nombre_area: entity.nombre_area,
      contacto: entity.contacto ?? undefined,
      telefono: entity.telefono ?? undefined,
      correo: entity.correo ?? undefined,
      is_active: entity.is_active ?? true,
      id_sucursal: entity.id_sucursal ?? 0,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  // Usado únicamente por el listado paginado (GET /areas), donde el
  // repositorio incluye la relación anidada sucursales -> clientes.
  static toListItem(entity: PrismaAreaConDetalle): AreaListItem {
    const area = AreaMapper.toDomain(entity);
    return {
      ...area,
      sucursal: entity.sucursales
        ? {
            id_sucursal: entity.sucursales.id_sucursal,
            nombre: entity.sucursales.nombre_sucursal,
          }
        : null,
      cliente: entity.sucursales?.clientes
        ? {
            id_cliente: entity.sucursales.clientes.id_cliente,
            nombre: entity.sucursales.clientes.nombre_principal,
          }
        : null,
    };
  }

  static toPersistence(domain: Area): Partial<PrismaArea> {
    return {
      ...(domain.id_area && { id_area: domain.id_area }),
      nombre_area: domain.nombre_area,
      contacto: domain.contacto,
      telefono: domain.telefono,
      correo: domain.correo,
      is_active: domain.is_active,
      id_sucursal: domain.id_sucursal,
    };
  }
}