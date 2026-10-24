import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { GetUsersFilterDto } from '../../application/dtos/get-users-filter.dto';

export class GetUsersQueryDto implements GetUsersFilterDto {
  @ApiPropertyOptional({
    description: 'Búsqueda parcial por nombre, apellido o correo del usuario',
    example: 'Juan',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de rol. Si se omite, retorna todos los roles.',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'id_rol debe ser un número entero' })
  @Min(1)
  id_rol?: number;

  @ApiPropertyOptional({
    description:
      'Filtrar por estado: true (activos) o false (inactivos). Si se omite, retorna ambos.',
    example: true,
  })
  @IsOptional()
  // Se lee el valor crudo (obj) porque enableImplicitConversion ya convirtió "false" en true.
  @Transform(({ obj, key }) => {
    const raw: unknown = obj[key];
    if (raw === 'true' || raw === true) return true;
    if (raw === 'false' || raw === false) return false;
    return raw === '' ? undefined : raw;
  })
  @IsBoolean({ message: 'is_active debe ser true o false' })
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
    description: 'Cantidad de registros por página (máximo 100)',
    default: 10,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
