import { ApiProperty } from '@nestjs/swagger';
import { EquipoEstadisticas } from '@/equipos/domain/entities/equipo.entity';

// KPI del inventario de equipos (GET /equipos/estadisticas). Cuenta solo
// equipos activos.
export class EquipoEstadisticasResponseDto implements EquipoEstadisticas {
  @ApiProperty({
    description: 'Total de equipos activos registrados',
    example: 1294,
  })
  total_equipos: number;

  @ApiProperty({
    description: 'Equipos activos asignados a un trabajador',
    example: 1148,
  })
  asignados: number;

  @ApiProperty({
    description: 'Equipos activos sin trabajador asignado',
    example: 146,
  })
  sin_asignar: number;
}
