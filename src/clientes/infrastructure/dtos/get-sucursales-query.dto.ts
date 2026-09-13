import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GetSucursalesFilterDto } from '@/clientes/domain/dto/get-sucursales-filter.dto';

export class GetSucursalesQueryDto implements GetSucursalesFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por cliente (empresa) dueño de la sucursal',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Término de búsqueda (nombre, encargado o correo)',
    example: 'Sucursal Centro',
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