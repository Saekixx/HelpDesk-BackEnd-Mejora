import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AssignSoftwareEquipmentDto {
  @ApiProperty({ description: 'ID del equipo a asociar', example: 1 })
  @IsNumber({}, { message: 'El ID del equipo debe ser un número' })
  @IsNotEmpty({ message: 'El ID del equipo es obligatorio' })
  id_equipo: number;

  @ApiProperty({
    description: 'Correo asociado a la cuenta de este equipo',
    example: 'cmendoza@metropolis.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El correo asociado debe ser texto' })
  correo_asociado?: string;

  @ApiProperty({
    description: 'Observaciones adicionales sobre la asignación',
    example: 'Equipo en buen estado, sin incidencias',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto' })
  observaciones?: string;

  @ApiProperty({
    description: 'Licencia específica o clave particular para el equipo',
    example: 'XXXXX-YYYYY-ZZZZZ',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La licencia específica debe ser texto' })
  licencia_especifica?: string;

  @ApiProperty({
    description: 'Contraseña o credencial encriptada',
    example: 'P@ssword123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto' })
  password_enc?: string;

  @ApiProperty({
    description: 'Fecha de instalación de la asignación',
    example: '2026-01-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de instalación debe ser válida (ISO 8601)' },
  )
  fecha_instalacion?: string;
}
