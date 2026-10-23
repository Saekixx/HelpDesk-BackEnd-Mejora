// src/dashboard/domain/ports/dashboard.repository.port.ts
import { AdminDashboardMetrics } from '../entities/admin-dashboard-metrics.entity';
import { DashboardFilterCriteria } from '../criteria/dashboard-filter.criteria';

export const DASHBOARD_REPOSITORY = 'DASHBOARD_REPOSITORY';

export interface DashboardRepositoryPort {
  getAdminMetrics(filters: DashboardFilterCriteria): Promise<AdminDashboardMetrics>;
}