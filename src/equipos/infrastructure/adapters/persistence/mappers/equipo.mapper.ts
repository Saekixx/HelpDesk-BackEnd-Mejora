import { equipos as PrismaEquipo, equipos_estado } from '@prisma/client';
import {
  ComponenteActual,
  ComponenteRetirado,
  Equipo,
  EquipoCreadoItem,
  EquipoDetail,
  EquipoListadoItem,
  EquipoOptionItem,
  SoftwareAsignado,
} from '@/equipos/domain/entities/equipo.entity';
import { EstadoEquipo } from '@/equipos/domain/enums/estado-equipo.enum';
import type { PrismaEquipoDetalleCompleto } from '../equipo-prisma.repository';
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

// Movimiento de hardware con su componente y técnico (ver INCLUDE_DETALLE).
type PrismaRegistroHardware =
  PrismaEquipoDetalleCompleto['registro_hardware'][number];

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

  // Registro (POST /equipos): solo los campos del contrato de creación.
  static toCreadoItem(entity: PrismaEquipoListado): EquipoCreadoItem {
    return {
      id_equipo: entity.id_equipo,
      nombre_equipo: entity.nombre_equipo,
      tipo: entity.tipo,
      marca_modelo: entity.marca_modelo,
      num_serie: entity.num_serie,
      estado: ESTADO_EQUIPO[entity.estado ?? 'Activo'],
      ult_revision: entity.ult_revision,
      rev_programada: entity.rev_programada,
      cliente: entity.clientes,
      sucursal: entity.sucursales,
      area: entity.area,
      trabajador: entity.usuarios,
      created_at: entity.created_at,
    };
  }

  // Opciones (GET /equipos/options): solo los campos que identifican al equipo.
  static toOptionItem(
    entity: Pick<
      PrismaEquipo,
      | 'id_equipo'
      | 'nombre_equipo'
      | 'num_serie'
      | 'tipo'
      | 'marca_modelo'
      | 'estado'
    >,
  ): EquipoOptionItem {
    return {
      id_equipo: entity.id_equipo,
      nombre_equipo: entity.nombre_equipo,
      num_serie: entity.num_serie,
      tipo: entity.tipo,
      marca_modelo: entity.marca_modelo,
      // La columna es nullable con default "Activo".
      estado: ESTADO_EQUIPO[entity.estado ?? 'Activo'],
    };
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

  static toDetail(entity: PrismaEquipoDetalleCompleto): EquipoDetail {
    const registros = entity.registro_hardware;

    return {
      id_equipo: entity.id_equipo,
      nombre_equipo: entity.nombre_equipo,
      tipo: entity.tipo,
      marca_modelo: entity.marca_modelo,
      estado: ESTADO_EQUIPO[entity.estado ?? 'Activo'],
      num_serie: entity.num_serie,
      ult_revision: entity.ult_revision,
      rev_programada: entity.rev_programada,
      is_active: entity.is_active ?? true,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      cliente: entity.clientes,
      sucursal: entity.sucursales,
      area: entity.area,
      trabajador: entity.usuarios,
      hardware: {
        componentes_actuales: registros
          .filter((rh) => rh.is_actual !== false)
          .map(EquipoMapper.toComponenteActual),
        historial: registros
          .filter((rh) => rh.is_actual === false)
          .map(EquipoMapper.toComponenteRetirado),
      },
      software: entity.software_equipos.map(EquipoMapper.toSoftwareAsignado),
    };
  }

  private static toComponenteActual(
    rh: PrismaRegistroHardware,
  ): ComponenteActual {
    return {
      id_RH: rh.id_RH,
      id_hardware: rh.id_hardware,
      tipo_componente: TipoComponente[rh.hardware.tipo_componente],
      marca_modelo: rh.hardware.marca_modelo,
      numero_serie: rh.hardware.numero_serie,
      proveedor: rh.hardware.proveedor,
      url_factura: rh.hardware.url_factura,
      salud_smart: rh.salud_smart,
      motivo_instalacion: rh.motivo_instalacion,
      fecha_instalacion: rh.fecha_instalacion,
      tecnico_responsable: rh.tecnico_responsable,
      is_active: rh.is_actual ?? true,
    };
  }

  private static toComponenteRetirado(
    rh: PrismaRegistroHardware,
  ): ComponenteRetirado {
    return {
      id_RH: rh.id_RH,
      id_hardware: rh.id_hardware,
      tipo_componente: TipoComponente[rh.hardware.tipo_componente],
      marca_modelo: rh.hardware.marca_modelo,
      numero_serie: rh.hardware.numero_serie,
      proveedor: rh.hardware.proveedor,
      fecha_instalacion: rh.fecha_instalacion,
      fecha_retiro: rh.fecha_retiro,
      motivo_retiro: rh.motivo_retiro,
      tecnico_responsable: rh.tecnico_responsable,
      is_active: rh.is_actual ?? false,
    };
  }

  private static toSoftwareAsignado(
    se: PrismaEquipoDetalleCompleto['software_equipos'][number],
  ): SoftwareAsignado {
    return {
      id_software_equipos: se.id_software_equipos,
      id_software: se.id_software,
      nombre_software: se.software.nombre_software,
      categoria: se.software.categoria,
      tipo_licencia: se.software.tipo_licencia,
      licencia_asignada: se.licencia_especifica,
      correo_asociado: se.correo_asociado,
      password_enc: se.password_enc,
      fecha_instalacion: se.fecha_instalacion,
      vencimiento: se.fecha_vencimiento ?? se.software.fecha_caducidad,
      observaciones: se.observaciones,
      is_active: se.is_active ?? true,
    };
  }
}
