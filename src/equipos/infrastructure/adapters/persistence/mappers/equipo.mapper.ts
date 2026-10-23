import { equipos as PrismaEquipo } from '@prisma/client';
import {
  ComponenteHardware,
  Equipo,
  EquipoDetail,
  EquipoListItem,
  RelacionSummary,
  SoftwareInstalado,
} from '@/equipos/domain/entities/equipo.entity';
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
      tipo: rh.hardware?.tipo_componente ?? '',
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
