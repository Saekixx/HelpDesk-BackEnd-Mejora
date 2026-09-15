import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEquipoDto } from '@/equipos/domain/dto/create-equipo.dto';

export class CreateEquipoHttpDto implements CreateEquipoDto {
  @ApiProperty({ description: 'Tipo de equipo', example: 'Laptop' })
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  readonly tipo: string;

  @ApiProperty({ description: 'Marca del equipo', example: 'Dell' })
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  readonly marca: string;

  @ApiPropertyOptional({
    description: 'Número de serie del equipo (único)',
    example: 'SN-2026-00123',
  })
  @IsOptional()
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  readonly num_serie?: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario final que usa el equipo',
    example: 'Carlos Ramírez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  readonly nombre_usuario?: string;

  @ApiPropertyOptional({
    description: 'Fecha de la última revisión (YYYY-MM-DD)',
    example: '2026-06-01',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de última revisión debe ser una fecha válida' })
  readonly ult_revision?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de la próxima revisión programada (YYYY-MM-DD)',
    example: '2026-12-01',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: 'La fecha de revisión programada debe ser una fecha válida',
  })
  readonly rev_programada?: Date;

  @ApiPropertyOptional({
    description: 'ID del trabajador (usuario) asignado al equipo',
    example: 5,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de trabajador debe ser un número entero' })
  readonly id_trabajador?: number;

  @ApiPropertyOptional({
    description: 'ID del cliente (empresa) dueño del equipo',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de cliente debe ser un número entero' })
  readonly id_cliente?: number;

  @ApiPropertyOptional({
    description: 'ID de la sucursal donde está asignado el equipo',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de sucursal debe ser un número entero' })
  readonly id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'ID del área donde está asignado el equipo',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de área debe ser un número entero' })
  readonly id_area?: number;

  @ApiPropertyOptional({
    description: 'Estado activo del equipo',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  readonly is_active?: boolean;
}