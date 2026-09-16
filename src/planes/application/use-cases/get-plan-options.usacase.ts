import {
  PLAN_REPOSITORY,
  PlanRepositoryPort,
} from '@/planes/domain/ports/plan.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { PlanesOptionDto } from '../dtos/get-plan-options.dto';

@Injectable()
export class GetPlanOptionsUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepositoryPort,
  ) {}

  async execute(): Promise<PlanesOptionDto[]> {
    return this.planRepository.getPlanOptions();
  }
}
