import { hardware as PrismaHardware, Prisma } from '@prisma/client';
import {
  Hardware,
  HardwareEquipoActual,
} from '@/hardware/domain/entities/hardware.entity';
import {
  ESTADO_HARDWARE_LABEL,
  EstadoHardware,
} from '@/hardware/domain/enums/estado-hardware.enum';
import {
  TIPO_COMPONENTE_LABEL,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';
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
      tipo_componente: TipoComponente[entity.tipo_componente],
      numero_serie: entity.numero_serie,
      marca_modelo: entity.marca_modelo,
      proveedor: entity.proveedor ?? undefined,
      fecha_compra: entity.fecha_compra ?? undefined,
      // Decimal de Prisma -> number
      costo_unitario: Number(entity.costo_unitario ?? 0),
      url_factura: entity.url_factura ?? undefined,
      estado: EstadoHardware[entity.estado],
      id_equipo_actual: entity.id_equipo_actual,
      equipo_actual: HardwareMapper.toEquipoActual(entity.equipo_actual),
      created_at: entity.created_at ?? undefined,
      updated_at: entity.updated_at ?? undefined,
    });
  }

  // Entidad de dominio -> datos de escritura de Prisma (crear y actualizar).
  static toPersistence(domain: Hardware): Prisma.hardwareUncheckedCreateInput {
    return {
      tipo_componente: domain.tipo_componente,
      numero_serie: domain.numero_serie,
      marca_modelo: domain.marca_modelo,
      proveedor: domain.proveedor ?? null,
      fecha_compra: domain.fecha_compra ?? null,
      costo_unitario: new Prisma.Decimal(domain.costo_unitario),
      url_factura: domain.url_factura ?? null,
      estado: domain.estado,
      id_equipo_actual: domain.id_equipo_actual,
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
      tipo_componente: domain.tipo_componente,
      tipo_componente_label: TIPO_COMPONENTE_LABEL[domain.tipo_componente],
      marca_modelo: domain.marca_modelo,
      proveedor: domain.proveedor ?? null,
      fecha_compra: domain.fecha_compra ?? null,
      costo_unitario: domain.costo_unitario,
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
