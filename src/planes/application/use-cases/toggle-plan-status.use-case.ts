import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '@/planes/domain/ports/plan.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from '@/planes/domain/entities/plan.entity';

@Injectable()
export class TogglePlanStatusUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepositoryPort,
  ) {}

  async execute(id: number): Promise<string> {
    // Validar si el plan existe usando excepciones HTTP de NestJS
    const existingPlan = await this.planRepository.findById(id);
    if (!existingPlan)
      throw new NotFoundException(`El plan con ID ${id} no existe`);

    // Cambiar el estado del plan
    const updatedPlan = new Plan({
      id_plan: existingPlan.id_plan,
      numero_plan: existingPlan.numero_plan,
      tipo: existingPlan.tipo,
      servicio: existingPlan.servicio,
      precio: existingPlan.precio,
      limite_equipos: existingPlan.limite_equipos,
      is_active: !existingPlan.is_active, // Cambiar el estado
      createdAt: existingPlan.createdAt,
      updatedAt: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el plan actualizado en el repositorio y devolver la entidad
    await this.planRepository.save(updatedPlan);

    // Devolver un mensaje indicando el nuevo estado del plan
    return `El plan con ID ${id} ahora está ${updatedPlan.is_active ? 'activo' : 'inactivo'}`;
  }
}
