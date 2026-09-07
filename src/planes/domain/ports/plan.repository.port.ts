import { Plan } from '../entities/plan.entity';

export const PLAN_REPOSITORY = 'PLAN_REPOSITORY';

export interface PlanRepositoryPort {
  save(plan: Plan): Promise<Plan>;
  findById(id: number): Promise<Plan | null>;
}
