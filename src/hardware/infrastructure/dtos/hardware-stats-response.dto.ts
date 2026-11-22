import { ApiProperty } from '@nestjs/swagger';

// Resumen de componentes por estado (GET /hardware/estadisticas)
export class HardwareStatsResponseDto {
  @ApiProperty({
    description:
      'Total de componentes registrados. Es la suma de asignadosEquipos, enStock, enMantenimiento y enBaja.',
    example: 120,
  })
  totalComponentes: number;

  @ApiProperty({
    description: 'Componentes asignados a un equipo (estado Instalado)',
    example: 80,
  })
  asignadosEquipos: number;

  @ApiProperty({
    description: 'Componentes disponibles en almacén (estado Disponible)',
    example: 25,
  })
  enStock: number;

  @ApiProperty({
    description: 'Componentes dados de baja (estado Baja / Descarte)',
    example: 5,
  })
  enBaja: number;

  @ApiProperty({
    description: 'Componentes en mantenimiento (estado En Mantenimiento)',
    example: 10,
  })
  enMantenimiento: number;
}
