import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  SOPORTE_TECNICO = 'SOPORTE_TECNICO',
  SOPORTE_INSITU = 'SOPORTE_INSITU',
  CLIENTE_EMPRESA = 'CLIENTE_EMPRESA',
  CLIENTE_SUCURSAL = 'CLIENTE_SUCURSAL',
  CLIENTE_TRABAJADOR = 'CLIENTE_TRABAJADOR',
}

export class UserSelectFilterDto {
  @ApiPropertyOptional({ description: 'Texto de búsqueda' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'ID de la sucursal' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  @IsInt()
  id_sucursal?: number;

  @ApiPropertyOptional({ description: 'ID del área' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  @IsInt()
  id_area?: number;

  @ApiPropertyOptional({ description: 'ID de la empresa/cliente' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  @IsInt()
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: UserRole,
    enumName: 'UserRole',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === 'ALL' ? undefined : value,
  )
  @IsEnum(UserRole)
  rol?: UserRole;
}
