// src/dashboard/infrastructure/controllers/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetAdminDashboardMetricsUseCase } from '../../application/use-cases/get-admin-dashboard-metrics.use-case';
import { GetAdminDashboardQueryDto } from '../../application/dtos/get-admin-dashboard-query.dto';
import { AdminDashboardResponseDto } from '../../application/dtos/admin-dashboard-response.dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '../../../auth/infrastructure/guards/role.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';

@ApiTags('Dashboard Administrador')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('dashboard')
@Roles('ADMIN') // Restringe estrictamente el módulo al rol administrador
export class DashboardController {
  constructor(
    private readonly getAdminDashboardMetricsUseCase: GetAdminDashboardMetricsUseCase,
  ) {}

  @Get('admin')
  @ApiOperation({
    summary: 'Obtener métricas globales del Dashboard de Administrador',
    description:
      'Devuelve KPIs de tickets, citas de hoy, desglose de clientes, equipos operativos, volumen de requerimientos e historial semanal, y alertas de licencias.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas del dashboard obtenidas exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado (Token JWT inválido o ausente).',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso prohibido (Se requiere rol de Administrador).',
  })
  async getAdminDashboard(
    @Query() query: GetAdminDashboardQueryDto,
  ): Promise<AdminDashboardResponseDto> {
    return this.getAdminDashboardMetricsUseCase.execute(query);
  }
}
