import { area as PrismaArea } from '@prisma/client';
import { Area } from '@/clientes/domain/entities/area.entity';

export class AreaMapper {
  static toDomain(entity: PrismaArea): Area {
    return new Area({
      id_area: entity.id_area,
      nombre_area: entity.nombre_area,
      contacto: entity.contacto ?? undefined,
      telefono: entity.telefono ?? undefined,
      correo: entity.correo ?? undefined,
      is_active: entity.is_active ?? true,
      id_sucursal: entity.id_sucursal ?? 0,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Area): Partial<PrismaArea> {
    return {
      ...(domain.id_area && { id_area: domain.id_area }),
      nombre_area: domain.nombre_area,
      contacto: domain.contacto,
      telefono: domain.telefono,
      correo: domain.correo,
      is_active: domain.is_active,
      id_sucursal: domain.id_sucursal,
    };
  }
}
