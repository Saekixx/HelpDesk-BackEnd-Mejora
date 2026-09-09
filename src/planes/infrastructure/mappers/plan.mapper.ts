import { planes as PrismaPlan, Prisma } from '@prisma/client';
import { Plan } from '@/planes/domain/entities/plan.entity';

export class PlanMapper {
  static toDomain(entity: PrismaPlan): Plan {
    let serviciosArray: string[] = [];

    if (entity.servicios) {
      if (typeof entity.servicios === 'string') {
        try {
          serviciosArray = JSON.parse(entity.servicios);
        } catch {
          serviciosArray = entity.servicios.split(',').map((s) => s.trim());
        }
      } else if (Array.isArray(entity.servicios)) {
        serviciosArray = entity.servicios as string[];
      }
    }

    return new Plan({
      id_plan: entity.id_plan,
      numero_plan: entity.numero_plan,
      tipo: entity.tipo,
      servicio: serviciosArray,
      precio: Number(entity.precio ?? 0),
      limite_equipos: entity.limite_equipos ?? 0,
      is_active: entity.is_active ?? true,
      createdAt: entity.created_at ?? undefined,
      updatedAt: entity.updated_at ?? undefined,
    });
  }

  static toPersistence(domain: Plan): Partial<PrismaPlan> {
    return {
      ...(domain.id_plan && { id_plan: domain.id_plan }),
      numero_plan: domain.numero_plan,
      tipo: domain.tipo,
      servicios: JSON.stringify(domain.servicio),
      precio: new Prisma.Decimal(domain.precio ?? 0),
      limite_equipos: domain.limite_equipos,
      is_active: domain.is_active,
    };
  }
}
