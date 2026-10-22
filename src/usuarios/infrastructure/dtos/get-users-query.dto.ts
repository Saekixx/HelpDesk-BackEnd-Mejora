import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { GetUsersFilterDto } from '../../application/dtos/get-users-filter.dto';

export class GetUsersQueryDto implements GetUsersFilterDto {
  @ApiPropertyOptional({
    description:
      'Búsqueda parcial por nombre, apellido, correo o nombre de la empresa',
    example: 'Juan',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de rol',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_rol?: number;

  @ApiPropertyOptional({
    enum: RolEnum,
    enumName: 'RolEnum',
    description:
      'Filtrar por nombre del rol. Equivale a id_rol; si se envían ambos, prevalece id_rol.',
    example: RolEnum.CLIENTE_EMPRESA,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === 'ALL' ? undefined : value,
  )
  @IsEnum(RolEnum, { message: 'El rol no es válido' })
  rol?: RolEnum;

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
    enum: ['activo', 'inactivo'],
    description:
      'Filtrar por estado ("activo" | "inactivo"). Equivale a is_active; si se envían ambos, prevalece is_active.',
    example: 'activo',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() || undefined : value,
  )
  @IsIn(['activo', 'inactivo'], {
    message: 'El estado debe ser "activo" o "inactivo"',
  })
  estado?: 'activo' | 'inactivo';

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
