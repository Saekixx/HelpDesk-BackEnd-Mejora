import { Software as PrismaSoftware } from '@prisma/client';
import { Software } from '@/software/domain/entities/software.entity';

export class SoftwareMapper {
  static toDomain(entity: PrismaSoftware): Software {
    return new Software({
      id_software: entity.idSoftware,
      nombre_software: entity.nombreSoftware,
      licencia: entity.licencia,
      correo: entity.correo,
      password: entity.password ?? undefined,
      fecha_instalacion: entity.fechaInstalacion,
      fecha_caducidad: entity.fechaCaducidad,
      proveedor: entity.proveedor,
      is_active: entity.isActive ?? true,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    });
  }

  static toPersistence(domain: Software): Partial<PrismaSoftware> {
    return {
      ...(domain.id_software && { idSoftware: domain.id_software }),
      nombreSoftware: domain.nombre_software,
      licencia: domain.licencia,
      correo: domain.correo,
      password: domain.password,
      fechaInstalacion: domain.fecha_instalacion,
      fechaCaducidad: domain.fecha_caducidad,
      proveedor: domain.proveedor,
      isActive: domain.is_active,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}