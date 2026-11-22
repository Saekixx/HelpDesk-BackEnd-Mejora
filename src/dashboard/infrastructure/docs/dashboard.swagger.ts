// src/dashboard/infrastructure/docs/dashboard.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

export function ApiGetAdminDashboardDocs() {
  return applyDecorators(
    ApiTags('Dashboard Administrador'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Obtener métricas consolidadas del Dashboard para Administrador',
      description:
        'Retorna todas las métricas operativas del sistema en una sola consulta: tarjetas KPI (tickets en progreso, citas del día, clientes y equipos), top de incidencias por cliente, citas programadas para hoy, volumen semanal de requerimientos y alertas de licencias próximas a vencer.',
    }),
    ApiResponse({
      status: 200,
      description: 'Métricas consolidadas obtenidas correctamente.',
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado. El token de autenticación (JWT) no es válido o expiró.',
    }),
    ApiResponse({
      status: 403,
      description: 'Acceso prohibido. El usuario autenticado no posee el rol de ADMINISTRADOR.',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor al procesar o calcular las métricas del dashboard.',
    }),
  );
}