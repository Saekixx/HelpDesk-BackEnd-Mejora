import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetTicketsFilterDto {
  @ApiPropertyOptional({
    description: 'Buscar por PIN, asunto o detalle del ticket',
    example: 'TK-101',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del ticket',
    enum: ['Pendiente', 'Asignado', 'En Progreso', 'Reabierto', 'Cerrado'],
    example: 'Pendiente',
  })
  @IsOptional()
  @IsEnum(['Pendiente', 'Asignado', 'En Progreso', 'Reabierto', 'Cerrado'])
  estado?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del cliente',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la sucursal',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del área',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_area?: number;

  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
