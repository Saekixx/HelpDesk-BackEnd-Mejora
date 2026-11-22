import { software as PrismaSoftware } from '@prisma/client';
import {
  Software,
  SoftwareState,
} from '@/software/domain/entities/software.entity';
import { SoftwareVaultResponseDto } from '@/software/infrastructure/dtos/get-software-equipos.dto';

export class SoftwareMapper {
  static toDomain(entity: PrismaSoftware): Software {
    return new Software({
      id_software: entity.id_software,
      id_cliente: entity.id_cliente ?? undefined,
      id_sucursal: entity.id_sucursal ?? undefined,
      nombre_software: entity.nombre_software,
      categoria: entity.categoria ?? undefined,
      tipo_licencia: entity.tipo_licencia,
      licencia_master_key: entity.licencia_master_key ?? undefined,
      proveedor: entity.proveedor ?? undefined,
      limite_equipos: entity.limite_equipos ?? 1,
      licencias_usadas: entity.licencias_usadas ?? 0,
      url_factura: entity.url_factura ?? undefined,
      fecha_compra: entity.fecha_compra ?? undefined,
      fecha_caducidad: entity.fecha_caducidad ?? undefined,
      // Mapeo del estado del enum de Prisma al Dominio (con casting seguro)
      estado: (entity.estado as SoftwareState) ?? SoftwareState.ACTIVO,
      is_active: entity.is_active ?? true,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Software): Partial<PrismaSoftware> {
    return {
      ...(domain.id_software && { id_software: domain.id_software }),
      ...(domain.id_cliente !== undefined && { id_cliente: domain.id_cliente }),
      ...(domain.id_sucursal !== undefined && {
        id_sucursal: domain.id_sucursal,
      }),
      nombre_software: domain.nombre_software,
      categoria: domain.categoria,
      tipo_licencia: domain.tipo_licencia as any,
      licencia_master_key: domain.licencia_master_key,
      proveedor: domain.proveedor,
      limite_equipos: domain.limite_equipos,
      licencias_usadas: domain.licencias_usadas,
      url_factura: domain.url_factura,
      fecha_compra: domain.fecha_compra,
      fecha_caducidad: domain.fecha_caducidad,
      // Guardamos el estado del dominio hacia Prisma
      estado: domain.estado as any,
      is_active: domain.is_active,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }

  static toVaultResponse(raw: any): SoftwareVaultResponseDto {
    return {
      id_software: raw.id_software,
      id_cliente: raw.id_cliente,
      id_sucursal: raw.id_sucursal,
      nombre_software: raw.nombre_software,
      limite_equipos: raw.limite_equipos ?? 0,
      licencias_usadas: raw.licencias_usadas ?? 0,
      licencia_master_key: raw.licencia_master_key,
      software_equipos: (raw.software_equipos || []).map((se: any) => ({
        id_software_equipos: se.id_software_equipos,
        correo_asociado: se.correo_asociado,
        licencia_especifica: se.licencia_especifica,
        fecha_instalacion: se.fecha_instalacion,
        observaciones: se.observaciones,
        equipos: {
          id_equipo: se.equipos.id_equipo,
          nombre_equipo: se.equipos.nombre_equipo,
          tipo: se.equipos.tipo,
          marca_modelo: se.equipos.marca_modelo,
          num_serie: se.equipos.num_serie,
        },
      })),
    };
  }
}
