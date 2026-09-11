import { Plan } from '@/planes/domain/entities/plan.entity';
import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '@/planes/domain/ports/plan.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByIdPlanesUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepositoryPort,
  ) {}

  async execute(id: number): Promise<Plan | null> {
    return this.planRepository.findById(id);
  }
}
