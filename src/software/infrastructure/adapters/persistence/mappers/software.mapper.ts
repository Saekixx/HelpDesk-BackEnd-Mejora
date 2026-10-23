import { software as PrismaSoftware } from '@prisma/client';
import { Software } from '@/software/domain/entities/software.entity';

export class SoftwareMapper {
  static toDomain(entity: PrismaSoftware): Software {
    return new Software({
      id_software: entity.id_software,
      nombre_software: entity.nombre_software,
      licencia: entity.tipo_licencia,
      correo: entity.licencia_master_key ?? '',
      password: undefined,
      fecha_instalacion: entity.fecha_compra ?? new Date(),
      fecha_caducidad: entity.fecha_caducidad ?? new Date(),
      proveedor: entity.proveedor ?? '',
      is_active: entity.is_active ?? true,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Software): Partial<PrismaSoftware> {
    return {
      ...(domain.id_software && { id_software: domain.id_software }),
      nombre_software: domain.nombre_software,
      proveedor: domain.proveedor,
      fecha_compra: domain.fecha_instalacion,
      fecha_caducidad: domain.fecha_caducidad,
      is_active: domain.is_active,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }
}
