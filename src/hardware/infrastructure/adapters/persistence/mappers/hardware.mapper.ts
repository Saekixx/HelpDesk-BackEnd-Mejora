import { hardware as PrismaHardware, Prisma } from '@prisma/client';
import {
  Hardware,
  HardwareEquipoActual,
  HardwareMovimiento,
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
import {
  HardwareDetailEquipoActualResponseDto,
  HardwareDetailResponseDto,
} from '@/hardware/infrastructure/dtos/hardware-detail-response.dto';
import { HardwareUpdateResponseDto } from '@/hardware/infrastructure/dtos/hardware-update-response.dto';
import { HardwareTransitionResponseDto } from '@/hardware/infrastructure/dtos/hardware-transition-response.dto';
import { HardwareStatsResponseDto } from '@/hardware/infrastructure/dtos/hardware-stats-response.dto';
import { HardwareEstadisticas } from '@/hardware/domain/ports/hardware.repository.port';

// Hardware tal como lo devuelve Prisma cuando se incluye `equipo_actual` y,
// en el detalle, el historial de movimientos (`registro_hardware`).
export type PrismaHardwareConEquipo = PrismaHardware & {
  equipo_actual?: {
    id_equipo: number;
    nombre_equipo: string | null;
    clientes: { id_cliente: number; nombre_principal: string } | null;
    sucursales: { id_sucursal: number; nombre_sucursal: string } | null;
    area: { id_area: number; nombre_area: string } | null;
  } | null;
  registro_hardware?: {
    id_RH: number;
    fecha_instalacion: Date;
    fecha_retiro: Date | null;
    motivo_retiro: string | null;
    is_actual: boolean | null;
    equipos: { id_equipo: number; nombre_equipo: string | null };
    tecnico_responsable: {
      id_usuario: number;
      nombre: string;
      apellido: string;
    } | null;
  }[];
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
      historial: entity.registro_hardware?.map(HardwareMapper.toMovimiento),
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

  // Entidad de dominio -> JSON de respuesta del detalle (GET /hardware/:id):
  // "Hoja de Vida del Componente" con ubicación actual, factura e historial.
  static toDetailResponse(domain: Hardware): HardwareDetailResponseDto {
    return {
      id_hardware: domain.id_hardware as number,
      numero_serie: domain.numero_serie,
      marca_modelo: domain.marca_modelo,
      proveedor: domain.proveedor ?? null,
      fecha_compra: domain.fecha_compra ?? null,
      costo_unitario: domain.costo_unitario,
      url_factura: domain.url_factura ?? null,
      tipo_componente: domain.tipo_componente,
      tipo_componente_label: TIPO_COMPONENTE_LABEL[domain.tipo_componente],
      estado: domain.estado,
      estado_label: ESTADO_HARDWARE_LABEL[domain.estado],
      equipo_actual: domain.equipo_actual
        ? HardwareMapper.toEquipoActualDetailResponse(domain.equipo_actual)
        : null,
      historial: domain.historial ?? [],
      created_at: domain.created_at,
      updated_at: domain.updated_at,
    };
  }

  // Entidad de dominio -> JSON de respuesta tras actualizar la ficha técnica
  // (PATCH /hardware/:id): datos editables, estado y fecha de actualización.
  static toUpdateResponse(domain: Hardware): HardwareUpdateResponseDto {
    return {
      id_hardware: domain.id_hardware as number,
      numero_serie: domain.numero_serie,
      marca_modelo: domain.marca_modelo,
      proveedor: domain.proveedor ?? null,
      fecha_compra: domain.fecha_compra ?? null,
      costo_unitario: domain.costo_unitario,
      url_factura: domain.url_factura ?? null,
      tipo_componente: domain.tipo_componente,
      tipo_componente_label: TIPO_COMPONENTE_LABEL[domain.tipo_componente],
      estado: domain.estado,
      estado_label: ESTADO_HARDWARE_LABEL[domain.estado],
      updated_at: domain.updated_at,
    };
  }

  // Entidad de dominio -> JSON de respuesta tras cambiar de estado
  // (PATCH /hardware/:id/transition): nuevo estado y equipo donde queda
  // instalado con su ubicación. El repositorio debe cargar `equipo_actual`;
  // `null` (sin equipo, o relación no cargada) se informa como sin asignar.
  static toTransitionResponse(domain: Hardware): HardwareTransitionResponseDto {
    return {
      id_hardware: domain.id_hardware as number,
      numero_serie: domain.numero_serie,
      marca_modelo: domain.marca_modelo,
      estado: domain.estado,
      estado_label: ESTADO_HARDWARE_LABEL[domain.estado],
      equipo_actual: domain.equipo_actual
        ? HardwareMapper.toEquipoActualResponse(domain.equipo_actual)
        : null,
      updated_at: domain.updated_at,
    };
  }

  // Conteos de dominio -> JSON de respuesta de GET /hardware/estadisticas
  static toStatsResponse(
    estadisticas: HardwareEstadisticas,
  ): HardwareStatsResponseDto {
    return {
      totalComponentes: estadisticas.total,
      asignadosEquipos: estadisticas.instalados,
      enStock: estadisticas.disponibles,
      enBaja: estadisticas.baja,
      enMantenimiento: estadisticas.mantenimiento,
    };
  }

  private static toMovimiento(
    registro: NonNullable<PrismaHardwareConEquipo['registro_hardware']>[number],
  ): HardwareMovimiento {
    return {
      id_RH: registro.id_RH,
      fecha_instalacion: registro.fecha_instalacion,
      fecha_retiro: registro.fecha_retiro,
      motivo_retiro: registro.motivo_retiro,
      is_actual: registro.is_actual ?? false,
      equipo: {
        id_equipo: registro.equipos.id_equipo,
        nombre_equipo: registro.equipos.nombre_equipo,
      },
      tecnico_responsable: registro.tecnico_responsable,
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

  private static toEquipoActualDetailResponse(
    equipo: HardwareEquipoActual,
  ): HardwareDetailEquipoActualResponseDto {
    const { cliente, sucursal, area } = equipo;

    return {
      id_equipo: equipo.id_equipo,
      // Mismo formato de código que usa el módulo de equipos (EQ-{id}).
      codigo: `EQ-${equipo.id_equipo}`,
      nombre_equipo: equipo.nombre_equipo ?? null,
      cliente: cliente
        ? { id_cliente: cliente.id, nombre_principal: cliente.nombre }
        : null,
      sucursal: sucursal
        ? { id_sucursal: sucursal.id, nombre_sucursal: sucursal.nombre }
        : null,
      area: area ? { id_area: area.id, nombre_area: area.nombre } : null,
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
