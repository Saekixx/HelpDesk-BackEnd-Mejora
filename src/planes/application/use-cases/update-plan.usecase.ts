import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '@/planes/domain/ports/plan.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Plan } from '@/planes/domain/entities/plan.entity';
import { UpdatePlanDto } from '../dtos/update-plan.dto';

@Injectable()
export class UpdatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepositoryPort,
  ) {}

  async execute(id: number, planData: UpdatePlanDto): Promise<void> {
    // Validar si el plan existe usando excepciones HTTP de NestJS
    const existingPlan = await this.planRepository.findById(id);
    if (!existingPlan) {
      throw new NotFoundException(`El plan con ID ${id} no existe`);
    }

    // Fusionar valores anteriores con los nuevos para soportar actualización parcial
    const updatedPlan = new Plan({
      id_plan: existingPlan.id_plan,
      numero_plan: planData.numero_plan ?? existingPlan.numero_plan,
      tipo: planData.tipo ?? existingPlan.tipo,
      servicio: planData.servicios ?? existingPlan.servicio,
      precio: planData.precio ?? existingPlan.precio,
      limite_equipos: planData.limite_equipos ?? existingPlan.limite_equipos,
      is_active: existingPlan.is_active,
      createdAt: existingPlan.createdAt,
      updatedAt: new Date(), // Actualizar la fecha de actualización
    });

    // Guardar el plan actualizado en el repositorio
    await this.planRepository.save(updatedPlan);
  }
}
