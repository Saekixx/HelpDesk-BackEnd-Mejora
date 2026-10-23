// src/dashboard/application/use-cases/get-admin-dashboard-metrics.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { 
  DASHBOARD_REPOSITORY, 
  DashboardRepositoryPort 
} from '../../domain/ports/dashboard.repository.port';
import { GetAdminDashboardQueryDto } from '../dtos/get-admin-dashboard-query.dto';
import { AdminDashboardMetrics } from '../../domain/entities/admin-dashboard-metrics.entity';

@Injectable()
export class GetAdminDashboardMetricsUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: DashboardRepositoryPort,
  ) {}

  async execute(query: GetAdminDashboardQueryDto): Promise<AdminDashboardMetrics> {
    // Transformamos los query params opcionales (strings) a objetos Date o Number si vienen definidos
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const id_cliente = query.id_cliente ? Number(query.id_cliente) : undefined;

    // Invocamos el puerto del repositorio pasando los filtros limpios
    return this.dashboardRepository.getAdminMetrics({
      startDate,
      endDate,
      id_cliente,
    });
  }
}