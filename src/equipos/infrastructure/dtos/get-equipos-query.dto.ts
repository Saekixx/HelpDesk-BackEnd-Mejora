import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GetEquiposFilterDto } from '@/equipos/domain/dto/get-equipos-filter.dto';

export class GetEquiposQueryDto implements GetEquiposFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por cliente (empresa) dueño del equipo',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por sucursal donde está asignado el equipo',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Término de búsqueda (tipo, marca o número de serie)',
    example: 'Laptop Dell',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar por estado activo/inactivo. Si se omite, retorna ambos.',
    example: true,
  })
  @IsOptional()
  @Transform(({ obj, key }) => {
    const rawValue = obj[key];
    if (rawValue === 'true' || rawValue === true) return true;
    if (rawValue === 'false' || rawValue === false) return false;
    return undefined;
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
    default: 1,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    default: 10,
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}