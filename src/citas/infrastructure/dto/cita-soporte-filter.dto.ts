import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CitaEstado } from '../../domain/entity/cita-soporte.entity';

export class CitaSoporteFilterDto {
  @ApiPropertyOptional({
    description:
      'Campo de búsqueda para filtrar por nombre del técnico, cliente o ID de cita',
    example: 'Luis',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'ID del cliente para filtrar citas',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'ID de la sucursal para filtrar citas',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Estado de la cita de soporte',
    enum: ['Pendiente', 'En_Camino', 'Completada', 'Cancelada', 'Reprogramada'],
    example: 'Pendiente',
  })
  @IsOptional()
  @IsEnum(['Pendiente', 'En_Camino', 'Completada', 'Cancelada', 'Reprogramada'])
  estado?: CitaEstado;

  @ApiPropertyOptional({
    description: 'Fecha programada de la cita (no es la fecha de creación)',
    type: String,
    format: 'date',
    example: '2026-10-15',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha_programada?: Date;

  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página para la paginación',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
