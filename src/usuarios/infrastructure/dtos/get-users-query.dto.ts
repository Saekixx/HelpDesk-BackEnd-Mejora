import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GetUsersFilterDto } from '../../application/dtos/get-users-filter.dto';

export class GetUsersQueryDto implements GetUsersFilterDto {
  @ApiPropertyOptional({
    description: 'Término de búsqueda (filtra por nombre, apellido o correo)',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de rol',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_rol?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de sucursal',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de área',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_area?: number;

  @ApiPropertyOptional({
    description:
      'Filtrar por estado activo/inactivo. Si se omite, retorna ambos.',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
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
  @IsNumber()
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
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
