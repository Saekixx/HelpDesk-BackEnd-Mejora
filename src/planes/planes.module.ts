import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { PLAN_REPOSITORY } from './domain/ports/plan.repository.port';
import { PlanPrismaRepository } from './infrastructure/adapters/persistence/plan-prisma.repository';
import { TogglePlanStatusUseCase } from './application/use-cases/toggle-plan-status.use-case';
import { UpdatePlanUseCase } from './application/use-cases/update-plan.usecase';
import { FindByIdPlanesUseCase } from './application/use-cases/find-by-id-plan.usecase';
import { FindAllPlanesUseCase } from './application/use-cases/find-all-planes.usecase';
import { CreatePlanUseCase } from './application/use-cases/create-plan.usecase';
import { PlanController } from './infrastructure/controllers/plan.controller';

@Module({
  imports: [CommonModule],
  controllers: [PlanController],
  providers: [
    // Casos de Uso
    CreatePlanUseCase,
    FindAllPlanesUseCase,
    FindByIdPlanesUseCase,
    UpdatePlanUseCase,
    TogglePlanStatusUseCase,

    // Repositorio
    {
      provide: PLAN_REPOSITORY,
      useClass: PlanPrismaRepository,
    },
  ],
  exports: [PLAN_REPOSITORY],
})
export class PlanesModule {}
