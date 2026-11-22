// src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { GetAdminDashboardMetricsUseCase } from './application/use-cases/get-admin-dashboard-metrics.use-case';
import { DASHBOARD_REPOSITORY } from './domain/ports/dashboard.repository.port';
import { DashboardPrismaRepository } from './infrastructure/adapters/persistence/dashboard-prisma.repository';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [
    GetAdminDashboardMetricsUseCase,
    PrismaService,
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: DashboardPrismaRepository,
    },
  ],
  exports: [
    GetAdminDashboardMetricsUseCase,
  ],
})
export class DashboardModule {}