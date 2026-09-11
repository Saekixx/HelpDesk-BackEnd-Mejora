import { Plan } from '@/planes/domain/entities/plan.entity';
import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '@/planes/domain/ports/plan.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindAllPlanesUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepositoryPort,
  ) {}

  async execute(): Promise<Plan[]> {
    return this.planRepository.findAll();
  }
}
