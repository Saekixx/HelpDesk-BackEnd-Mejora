import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
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
    enum: RolEnum,
    enumName: 'RolEnum',
    description:
      'Filtrar por rol. Si se omite (o se envía "ALL"), retorna todos.',
    example: RolEnum.CLIENTE_EMPRESA,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === 'ALL' ? undefined : value,
  )
  @IsEnum(RolEnum, { message: 'El rol no es válido' })
  rol?: RolEnum;

  @ApiPropertyOptional({
    enum: ['activo', 'inactivo'],
    description:
      'Filtrar por estado ("activo" | "inactivo"). Si se omite, retorna ambos.',
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
