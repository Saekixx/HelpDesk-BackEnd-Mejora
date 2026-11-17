import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { AsignarEquipoDto } from '@/equipos/domain/dto/asignar-equipo.dto';

// Longitud máxima de la observación (la columna es TEXT; este tope es de negocio).
const OBSERVACIONES_MAX_LENGTH = 500;

// Body de PATCH /equipos/:id/asignar
export class AsignarEquipoHttpDto implements AsignarEquipoDto {
  @ApiProperty({
    description:
      'ID del trabajador al que se asigna el equipo. Debe existir, estar activo y pertenecer al mismo cliente del equipo',
    example: 5,
    minimum: 1,
  })
  @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
  @Min(1, { message: 'El ID del trabajador debe ser mayor o igual a 1' })
  @IsNotEmpty({ message: 'El ID del trabajador es obligatorio' })
  readonly id_trabajador: number;

  @ApiPropertyOptional({
    description:
      'Observación o motivo de la asignación. Si se omite (o llega vacía) no se modifica la observación actual del equipo',
    example: 'Entrega de laptop por ingreso a contabilidad',
    maxLength: OBSERVACIONES_MAX_LENGTH,
  })
  // Recorta espacios; un texto vacío o null equivale a no enviarla.
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value ?? undefined;
    return value.trim() || undefined;
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @MaxLength(OBSERVACIONES_MAX_LENGTH, {
    message: `Las observaciones no pueden exceder los ${OBSERVACIONES_MAX_LENGTH} caracteres`,
  })
  readonly observaciones?: string;
}
