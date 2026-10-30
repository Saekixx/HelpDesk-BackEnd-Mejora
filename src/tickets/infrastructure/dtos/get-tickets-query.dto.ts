import { EstadoTicket } from '@/tickets/domain/entities/ticket.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetTicketsFilterDto {
  @ApiPropertyOptional({
    description: 'Buscar por PIN, asunto o detalle del ticket',
    example: 'TK-101',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value && typeof value === 'string' && value.trim() !== ''
      ? value.trim()
      : undefined,
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del ticket',
    enum: EstadoTicket,
    example: EstadoTicket.PENDIENTE,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value && typeof value === 'string' && value.trim() !== '' && value !== '--'
      ? value.trim()
      : undefined,
  )
  @IsEnum(EstadoTicket)
  estado?: EstadoTicket;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del cliente',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value && !isNaN(Number(value)) ? Number(value) : undefined,
  )
  @IsInt()
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de la sucursal',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value && !isNaN(Number(value)) ? Number(value) : undefined,
  )
  @IsInt()
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del área',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value && !isNaN(Number(value)) ? Number(value) : undefined,
  )
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
