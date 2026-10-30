import { software as PrismaSoftware } from '@prisma/client';
import { Software, SoftwareState } from '@/software/domain/entities/software.entity';

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
      ...(domain.id_sucursal !== undefined && { id_sucursal: domain.id_sucursal }),
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
}