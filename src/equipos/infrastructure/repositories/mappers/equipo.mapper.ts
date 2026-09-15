import { equipos as PrismaEquipo } from '@prisma/client';
import {
  Equipo,
  EquipoListItem,
  RelacionSummary,
} from '@/equipos/domain/entities/equipo.entity';

type PrismaEquipoConDetalle = PrismaEquipo & {
  clientes: { id_cliente: number; nombre_principal: string } | null;
  sucursales: { id_sucursal: number; nombre_sucursal: string } | null;
  area: { id_area: number; nombre_area: string } | null;
  usuarios: { id_usuario: number; nombre: string; apellido: string } | null;
};

export class EquipoMapper {
  static toDomain(entity: PrismaEquipo): Equipo {
    return new Equipo({
      id_equipo: entity.id_equipo,
      tipo: entity.tipo,
      marca: entity.marca,
      num_serie: entity.num_serie ?? undefined,
      nombre_usuario: entity.nombre_usuario ?? undefined,
      ult_revision: entity.ult_revision ?? undefined,
      rev_programada: entity.rev_programada ?? undefined,
      id_trabajador: entity.id_trabajador ?? undefined,
      id_cliente: entity.id_cliente ?? undefined,
      id_sucursal: entity.id_sucursal ?? undefined,
      id_area: entity.id_area ?? undefined,
      is_active: entity.is_active ?? true,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  // Usado únicamente por el listado paginado (GET /equipos), donde el
  // repositorio incluye las relaciones resumidas de cliente, sucursal,
  // área y trabajador asignado.
  static toListItem(entity: PrismaEquipoConDetalle): EquipoListItem {
    const equipo = EquipoMapper.toDomain(entity);

    const toSummary = (
      id?: number,
      nombre?: string,
    ): RelacionSummary | null =>
      id !== undefined && nombre !== undefined ? { id, nombre } : null;

    return {
      ...equipo,
      cliente: entity.clientes
        ? toSummary(entity.clientes.id_cliente, entity.clientes.nombre_principal)
        : null,
      sucursal: entity.sucursales
        ? toSummary(
            entity.sucursales.id_sucursal,
            entity.sucursales.nombre_sucursal,
          )
        : null,
      area: entity.area
        ? toSummary(entity.area.id_area, entity.area.nombre_area)
        : null,
      trabajador: entity.usuarios
        ? toSummary(
            entity.usuarios.id_usuario,
            `${entity.usuarios.nombre} ${entity.usuarios.apellido}`,
          )
        : null,
    };
  }
}