import { equipos as PrismaEquipo } from '@prisma/client';
import {
  ComponenteHardware,
  Equipo,
  EquipoDetail,
  EquipoListItem,
  RelacionSummary,
  SoftwareInstalado,
} from '@/equipos/domain/entities/equipo.entity';
// Tipo derivado de Prisma.equiposGetPayload en el propio repositorio (fuente
// única de verdad: el include real y este tipo nunca pueden desincronizarse,
// que es justo lo que causaba el error 'Property software is missing').
import type { PrismaEquipoDetalleCompleto } from '../equipo-prisma.repository';

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


  // Genera el código legible del equipo a partir de su id. No existe como
  // columna en la base de datos: se deriva en cada lectura.
  static formatCodigo(idEquipo: number): string {
    return `EQ-${idEquipo}`;
  }

  private static toComponenteHardware(
    rh: PrismaEquipoDetalleCompleto['registro_hardware'][number],
  ): ComponenteHardware {
    return {
      id_RH: rh.id_RH,
      // tipo, marca y url_factura NO son columnas de registro_hardware:
      // vienen de la tabla `hardware` relacionada (vía id_hardware). Si el
      // registro no tiene hardware asociado, no hay forma de saberlos (null).
      tipo: rh.hardware?.tipo_equipo ?? null,
      marca: rh.hardware?.marca ?? null,
      url_factura: rh.hardware?.url_factura ?? null,
      descripcion: rh.descripcion,
      serie: rh.serie,
      proveedor: rh.proveedor,
      fecha_instalacion: rh.fecha_instalacion,
      // is_actual SÍ es una columna propia de registro_hardware (distinta
      // de hardware.is_active). null se trata como "actual" (ver el
      // filtro !== false en toDetail).
      is_active: rh.is_actual ?? true,
    };
  }

  // Usado únicamente por GET /equipos/:id (vista de detalle), donde el
  // repositorio incluye registro_hardware -> hardware y
  // software_equipos -> software.
  static toDetail(entity: PrismaEquipoDetalleCompleto): EquipoDetail {
    const listItem = EquipoMapper.toListItem(entity);

    // componentes_actuales: is_actual !== false (true o null).
    // historial: is_actual === false.
    const actuales = entity.registro_hardware.filter(
      (rh) => rh.is_actual !== false,
    );
    const historicos = entity.registro_hardware.filter(
      (rh) => rh.is_actual === false,
    );

    const software: SoftwareInstalado[] = entity.software_equipos.map((se) => ({
      id_software_equipos: se.id_software_equipos,
      id_software: se.software.id_software,
      nombre: se.software.nombre_software,
      vencimiento: se.software.fecha_caducidad,
      licencia_asignada: se.licencia_asignada ?? null,
      fecha_instalacion: se.fecha_instalacion ?? null,
      observaciones: se.observaciones ?? null,
      is_active: se.is_active ?? true,
    }));

    return {
      ...listItem,
      codigo: EquipoMapper.formatCodigo(entity.id_equipo),
      hardware: {
        componentes_actuales: actuales.map(EquipoMapper.toComponenteHardware),
        historial: historicos.map(EquipoMapper.toComponenteHardware),
      },
      software,
    };
  }
}