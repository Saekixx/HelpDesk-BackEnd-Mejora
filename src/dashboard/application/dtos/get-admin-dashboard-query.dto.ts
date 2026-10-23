// src/dashboard/application/dtos/get-admin-dashboard-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsNumberString } from 'class-validator';

export class GetAdminDashboardQueryDto {
  @ApiPropertyOptional({ description: 'Fecha de inicio para filtrar métricas (Formato ISO-8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin para filtrar métricas (Formato ISO-8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filtrar métricas por un ID de cliente específico' })
  @IsOptional()
  @IsNumberString()
  id_cliente?: string;
}