import { hardware as PrismaHardware } from '@prisma/client';
import {
  Hardware,
  HardwareEquipoActual,
} from '@/hardware/domain/entities/hardware.entity';
import {
  ESTADO_HARDWARE_LABEL,
  EstadoHardware,
} from '@/hardware/domain/enums/estado-hardware.enum';
import {
  HardwareEquipoActualResponseDto,
  HardwareResponseDto,
} from '@/hardware/infrastructure/dtos/hardware-response.dto';

// Hardware tal como lo devuelve Prisma cuando se incluye `equipo_actual`.
export type PrismaHardwareConEquipo = PrismaHardware & {
  equipo_actual?: {
    id_equipo: number;
    nombre_equipo: string | null;
    clientes: { id_cliente: number; nombre_principal: string } | null;
    sucursales: { id_sucursal: number; nombre_sucursal: string } | null;
    area: { id_area: number; nombre_area: string } | null;
  } | null;
};

export class HardwareMapper {
  static toDomain(entity: PrismaHardwareConEquipo): Hardware {
    return new Hardware({
      id_hardware: entity.id_hardware,
      tipo_equipo: entity.tipo_componente,
      numero_serie: entity.numero_serie,
      fecha_compra: entity.fecha_compra ?? new Date(),
      marca: entity.marca_modelo,
      proveedor: entity.proveedor ?? '',
      url_factura: entity.url_factura ?? undefined,
      descripcion: undefined,
      ult_revision: undefined,
      rev_programada: undefined,
      estado: EstadoHardware[entity.estado],
      equipo_actual: HardwareMapper.toEquipoActual(entity.equipo_actual),
      created_at: entity.created_at ?? undefined,
      updated_at: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Hardware): Partial<PrismaHardware> {
    return {
      ...(domain.id_hardware && { id_hardware: domain.id_hardware }),
      tipo_componente: domain.tipo_equipo,
      numero_serie: domain.numero_serie,
      fecha_compra: domain.fecha_compra,
      marca_modelo: domain.marca,
      proveedor: domain.proveedor,
      url_factura: domain.url_factura,
      estado: domain.estado,
      created_at: domain.created_at,
      updated_at: domain.updated_at,
    };
  }

  // Entidad de dominio -> JSON de respuesta HTTP (solo para hardware ya
  // persistido, por eso `id_hardware` siempre está definido).
  static toResponse(domain: Hardware): HardwareResponseDto {
    return {
      id_hardware: domain.id_hardware as number,
      numero_serie: domain.numero_serie,
      tipo_equipo: domain.tipo_equipo,
      marca: domain.marca,
      proveedor: domain.proveedor,
      fecha_compra: domain.fecha_compra,
      url_factura: domain.url_factura,
      estado: domain.estado,
      estado_label: ESTADO_HARDWARE_LABEL[domain.estado],
      is_active: domain.is_active,
      equipo_actual: domain.equipo_actual
        ? HardwareMapper.toEquipoActualResponse(domain.equipo_actual)
        : null,
      created_at: domain.created_at,
      updated_at: domain.updated_at,
    };
  }

  // undefined = relación no cargada; null = hardware sin equipo asignado.
  private static toEquipoActual(
    equipo: PrismaHardwareConEquipo['equipo_actual'],
  ): HardwareEquipoActual | null | undefined {
    if (equipo === undefined) return undefined;
    if (equipo === null) return null;

    return {
      id_equipo: equipo.id_equipo,
      nombre_equipo: equipo.nombre_equipo ?? undefined,
      cliente: equipo.clientes
        ? {
            id: equipo.clientes.id_cliente,
            nombre: equipo.clientes.nombre_principal,
          }
        : null,
      sucursal: equipo.sucursales
        ? {
            id: equipo.sucursales.id_sucursal,
            nombre: equipo.sucursales.nombre_sucursal,
          }
        : null,
      area: equipo.area
        ? { id: equipo.area.id_area, nombre: equipo.area.nombre_area }
        : null,
    };
  }

  private static toEquipoActualResponse(
    equipo: HardwareEquipoActual,
  ): HardwareEquipoActualResponseDto {
    return {
      id_equipo: equipo.id_equipo,
      // Mismo formato de código que usa el módulo de equipos (EQ-{id}).
      codigo: `EQ-${equipo.id_equipo}`,
      nombre_equipo: equipo.nombre_equipo ?? null,
      cliente: equipo.cliente,
      sucursal: equipo.sucursal,
      area: equipo.area,
    };
  }
}
