import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { PLAN_REPOSITORY } from './domain/ports/plan.repository.port';
import { PlanPrismaRepository } from './infrastructure/adapters/plan-prisma.repository';

@Module({
  imports: [CommonModule],
  providers: [
    {
      provide: PLAN_REPOSITORY,
      useClass: PlanPrismaRepository,
    },
  ],
  exports: [PLAN_REPOSITORY],
})
export class PlanesModule {}
