import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '@/planes/domain/ports/plan.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { CreatePlanDto } from '../dtos/create-plan.dto';
import { Plan } from '@/planes/domain/entities/plan.entity';

@Injectable()
export class CreatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepositoryPort,
  ) {}

  async execute(planData: CreatePlanDto): Promise<void> {
    // Mapear los datos del DTO a la entidad Plan
    const newPlan = new Plan({
      numero_plan: planData.numero_plan,
      tipo: planData.tipo,
      servicio: planData.servicio,
      precio: planData.precio,
      limite_equipos: planData.limite_equipos,
      is_active: true,
    });
    // Guardar el nuevo plan en el repositorio
    await this.planRepository.save(newPlan);
  }
}
