import { Zona } from '@/zonas/domain/entities/zona.entity';
import { zonas as PrismaZonas } from '@prisma/client';

export class ZonaMapper {
  static toDomain(entity: PrismaZonas): Zona {
    return new Zona({
      nombre_zona: entity.nombre_zona ?? '',
      descripcion: entity.descripcion ?? '',
      is_active: entity.is_active ?? true,
      createdAt: entity.created_at ?? new Date(),
      updatedAt: entity.updated_at ?? new Date(),
    });
  }

  static toPersistence(domain: Zona): Partial<PrismaZonas> {
    return {
      ...(domain.id_zona && { id_zona: domain.id_zona }),
      nombre_zona: domain.nombre_zona,
      descripcion: domain.descripcion,
      is_active: domain.is_active,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }
}
