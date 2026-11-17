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
import { ReemplazarComponenteStockDto } from '@/equipos/domain/dto/reemplazar-componente-stock.dto';
import { recortar, recortarOUndefined } from './body-transforms.helpers';

export class ReemplazarComponenteStockHttpDto
  implements ReemplazarComponenteStockDto
{
  @ApiProperty({
    description:
      'ID del componente de hardware en stock que reemplaza al componente actual',
    example: 15,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNotEmpty({ message: 'El ID del hardware nuevo es obligatorio' })
  @IsInt({ message: 'El ID del hardware nuevo debe ser un número entero' })
  @Min(1, { message: 'El ID del hardware nuevo debe ser mayor o igual a 1' })
  readonly id_hardware_nuevo: number;

  @ApiProperty({
    description: 'Fecha del reemplazo (ISO 8601)',
    example: '2026-11-17',
  })
  @Transform(recortar)
  @IsNotEmpty({ message: 'La fecha de reemplazo es obligatoria' })
  @IsDateString(
    { strict: true },
    { message: 'La fecha de reemplazo debe ser una fecha válida (ISO 8601)' },
  )
  readonly fecha_reemplazo: string;

  @ApiPropertyOptional({
    description: 'Observaciones o motivo del reemplazo',
    example: 'El disco anterior presentaba sectores dañados',
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
