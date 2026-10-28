import { ApiProperty } from '@nestjs/swagger';

// Total de sucursales y las creadas durante el mes en curso
export class TotalSucursalesStatsDto {
  @ApiProperty({ description: 'Cantidad total de sucursales', example: 24 })
  cantidad: number;

  @ApiProperty({
    description: 'Sucursales creadas durante el mes en curso',
    example: 3,
  })
  nuevasEsteMes: number;
}

// Sedes principales
export class SedesPrincipalesStatsDto {
  @ApiProperty({ description: 'Cantidad de sedes principales', example: 8 })
  cantidad: number;
}

// Sucursales operativas (activas)
export class SucursalesOperativasStatsDto {
  @ApiProperty({
    description: 'Cantidad de sucursales operativas (activas)',
    example: 21,
  })
  cantidad: number;
}

// Áreas cubiertas por las sucursales
export class AreasCoberturadasStatsDto {
  @ApiProperty({ description: 'Cantidad de áreas cubiertas', example: 56 })
  cantidad: number;
}

// Estadísticas del dashboard de gestión de sucursales
export class GetSucursalStatsResponseDto {
  @ApiProperty({ type: TotalSucursalesStatsDto })
  totalSucursales: TotalSucursalesStatsDto;

  @ApiProperty({ type: SedesPrincipalesStatsDto })
  sedesPrincipales: SedesPrincipalesStatsDto;

  @ApiProperty({ type: SucursalesOperativasStatsDto })
  sucursalesOperativas: SucursalesOperativasStatsDto;

  @ApiProperty({ type: AreasCoberturadasStatsDto })
  areasCoberturadas: AreasCoberturadasStatsDto;
}
