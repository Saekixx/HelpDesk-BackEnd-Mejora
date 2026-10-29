import { area as PrismaArea } from '@prisma/client';
import {
  Area,
  AreaListItem,
  AreaDetailView,
} from '@/clientes/domain/entities/area.entity';

// Forma del resultado de Prisma cuando el findAll incluye la sucursal y,
// anidado dentro de ella, el cliente (ver AreaPrismaRepository.findAll).
type PrismaAreaConDetalle = PrismaArea & {
  sucursales: {
    id_sucursal: number;
    nombre_sucursal: string;
    clientes: { id_cliente: number; nombre_principal: string } | null;
  } | null;
};

// Forma del resultado de Prisma para la consulta por ID del modal (GET /areas/:id).
type PrismaAreaConFicha = PrismaArea & {
  sucursales: {
    id_sucursal: number; // Aseguramos que traiga también el id_sucursal si se requiere
    nombre_sucursal: string;
    clientes: { nombre_principal: string } | null;
  } | null;
  _count: {
    equipos: number;
  };
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

  // Usado para alimentar el modal "Ficha de Área" (GET /areas/:id)
  static toDetailView(entity: PrismaAreaConFicha): AreaDetailView {
    return {
      id_area: entity.id_area,
      nombre_area: entity.nombre_area,
      is_active: entity.is_active ?? true,
      id_sucursal: entity.id_sucursal ?? 0, // <-- Incluido aquí para satisfacer AreaDetailView
      empresa: entity.sucursales?.clientes?.nombre_principal ?? 'Sin empresa',
      sucursal_asignada: entity.sucursales?.nombre_sucursal ?? 'Sin sucursal',
      encargado_responsable: entity.contacto ?? 'No asignado',
      total_equipos: entity._count?.equipos ?? 0,
      telefono: entity.telefono ?? '',
      correo: entity.correo ?? '',
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