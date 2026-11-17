import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { MontarComponenteStockDto } from '@/equipos/domain/dto/montar-componente-stock.dto';

// Texto sin espacios al inicio ni al final; si queda vacío se trata como
// ausente (undefined) para que @IsOptional lo omita. Otros tipos pasan sin
// cambios para que los rechace el validador correspondiente.
const recortarOUndefined = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const texto = value.trim();
  return texto === '' ? undefined : texto;
};

// Texto requerido sin espacios al inicio ni al final (otros tipos pasan sin
// cambios).
const recortar = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class MontarComponenteStockHttpDto implements MontarComponenteStockDto {
  @ApiProperty({
    description: 'ID del componente de hardware en stock que se va a montar',
    example: 15,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID de hardware es obligatorio' })
  @IsInt({ message: 'El ID de hardware debe ser un número entero' })
  @Min(1, { message: 'El ID de hardware debe ser mayor o igual a 1' })
  readonly id_hardware: number;

  @ApiProperty({
    description: 'Fecha de instalación del componente (ISO 8601)',
    example: '2026-11-17',
  })
  @Transform(recortar)
  @IsNotEmpty({ message: 'La fecha de instalación es obligatoria' })
  @IsDateString(
    { strict: true },
    { message: 'La fecha de instalación debe ser una fecha válida (ISO 8601)' },
  )
  readonly fecha_instalacion: string;

  @ApiPropertyOptional({
    description: 'Observaciones o motivo de la instalación',
    example: 'Ampliación de memoria solicitada por el usuario',
    maxLength: 1000,
  })
  @IsOptional()
  @Transform(recortarOUndefined)
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  @MaxLength(1000, {
    message: 'Las observaciones no pueden exceder los 1000 caracteres',
  })
  readonly observaciones?: string;
}
