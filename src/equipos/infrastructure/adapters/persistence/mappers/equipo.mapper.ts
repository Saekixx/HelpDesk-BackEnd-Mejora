import { equipos as PrismaEquipo, equipos_estado } from '@prisma/client';
import {
  ComponenteHardware,
  Equipo,
  EquipoDetail,
  EquipoListadoItem,
  EquipoListItem,
  RelacionSummary,
  SoftwareInstalado,
} from '@/equipos/domain/entities/equipo.entity';
import { EstadoEquipo } from '@/equipos/domain/enums/estado-equipo.enum';
import type { PrismaEquipoDetalleCompleto } from '../equipo-prisma.repository';
import {
  TIPO_COMPONENTE_LABEL,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';

type PrismaEquipoConDetalle = PrismaEquipo & {
  clientes: { id_cliente: number; nombre_principal: string } | null;
  sucursales: { id_sucursal: number; nombre_sucursal: string } | null;
  area: { id_area: number; nombre_area: string } | null;
  usuarios: { id_usuario: number; nombre: string; apellido: string } | null;
};

// Enum de Prisma -> enum de dominio (mismos valores; el Record garantiza que
// no quede ningún estado sin mapear).
const ESTADO_EQUIPO: Record<equipos_estado, EstadoEquipo> = {
  Activo: EstadoEquipo.ACTIVO,
  En_Almacen: EstadoEquipo.EN_ALMACEN,
  En_Mantenimiento: EstadoEquipo.EN_MANTENIMIENTO,
  Retirado: EstadoEquipo.RETIRADO,
};

// Resultado de Prisma con las relaciones del listado (ver INCLUDE_RESUMEN).
type PrismaEquipoListado = PrismaEquipo & {
  clientes: { id_cliente: number; nombre_principal: string } | null;
  sucursales: { id_sucursal: number; nombre_sucursal: string } | null;
  area: { id_area: number; nombre_area: string } | null;
  usuarios: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    correo: string | null;
  } | null;
};

export class EquipoMapper {
  static toDomain(entity: PrismaEquipo): Equipo {
    return new Equipo({
      id_equipo: entity.id_equipo,
      tipo: entity.tipo,
      marca: entity.marca_modelo ?? '',
      nombre_equipo: entity.nombre_equipo ?? undefined,
      num_serie: entity.num_serie ?? undefined,
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

  // Listado (GET /equipos): relaciones con sus campos completos.
  static toListadoItem(entity: PrismaEquipoListado): EquipoListadoItem {
    return {
      ...EquipoMapper.toDomain(entity),
      // La columna es nullable con default "Activo".
      estado: ESTADO_EQUIPO[entity.estado ?? 'Activo'],
      cliente: entity.clientes,
      sucursal: entity.sucursales,
      area: entity.area,
      trabajador: entity.usuarios,
    };
  }

  static toListItem(entity: PrismaEquipoConDetalle): EquipoListItem {
    const equipo = EquipoMapper.toDomain(entity);

    const toSummary = (id?: number, nombre?: string): RelacionSummary | null =>
      id !== undefined && nombre !== undefined ? { id, nombre } : null;

    return {
      ...equipo,
      cliente: entity.clientes
        ? toSummary(
            entity.clientes.id_cliente,
            entity.clientes.nombre_principal,
          )
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

  static formatCodigo(idEquipo: number): string {
    return `EQ-${idEquipo}`;
  }

  static toComponenteHardware(
    rh: PrismaEquipoDetalleCompleto['registro_hardware'][number],
  ): ComponenteHardware {
    return {
      id_RH: rh.id_RH,
      tipo: rh.hardware
        ? TIPO_COMPONENTE_LABEL[TipoComponente[rh.hardware.tipo_componente]]
        : '',
      marca: rh.hardware?.marca_modelo ?? '',
      url_factura: rh.hardware?.url_factura ?? undefined,
      descripcion: rh.motivo_retiro ?? '',
      serie: rh.hardware?.numero_serie ?? '',
      proveedor: rh.hardware?.proveedor ?? '',
      fecha_instalacion: rh.fecha_instalacion,
      is_active: rh.is_actual ?? true,
    };
  }

  static toDetail(entity: PrismaEquipoDetalleCompleto): EquipoDetail {
    const listItem = EquipoMapper.toListItem(entity);

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
      vencimiento:
        se.fecha_vencimiento ?? se.software.fecha_caducidad ?? new Date(),
      licencia_asignada: se.licencia_especifica ?? null, // Cambiado de undefined a null
      fecha_instalacion: se.fecha_instalacion ?? null, // Cambiado de undefined a null
      observaciones: se.observaciones ?? null, // Cambiado de undefined a null
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
