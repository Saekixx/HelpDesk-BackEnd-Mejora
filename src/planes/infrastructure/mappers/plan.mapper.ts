import { Plan } from '../../domain/entities/plan.entity';
import { PlanEntity } from '../entities/plan.entity';

export class PlanMapper {
  static toDomain(entity: PlanEntity): Plan {
    return new Plan({
      id_plan: entity.id_plan,
      numero_plan: entity.numero_plan,
      tipo: entity.tipo,
      servicio: entity.servicio,
      precio: Number(entity.precio),
      limite_equipos: entity.limite_equipos,
      is_active: entity.is_active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: Plan): PlanEntity {
    const entity = new PlanEntity();
    if (domain.id_plan) {
      entity.id_plan = domain.id_plan;
    }
    entity.numero_plan = domain.numero_plan;
    entity.tipo = domain.tipo;
    entity.servicio = domain.servicio;
    entity.precio = domain.precio;
    entity.limite_equipos = domain.limite_equipos;
    entity.is_active = domain.is_active;
    return entity;
  }
}
