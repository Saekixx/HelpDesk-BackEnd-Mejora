import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RegistrarReemplazarComponenteDto } from '@/equipos/domain/dto/registrar-reemplazar-componente.dto';
import {
  normalizarTipoComponente,
  TIPO_COMPONENTE_LABEL,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';
import { recortar, recortarOUndefined } from './body-transforms.helpers';

export class RegistrarReemplazarComponenteHttpDto
  implements RegistrarReemplazarComponenteDto
{
  @ApiProperty({
    description: `Tipo de componente. Acepta la clave del enum o la etiqueta del modal: ${Object.values(TIPO_COMPONENTE_LABEL).join(', ')}`,
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.ALMACENAMIENTO_SSD,
  })
  @Transform(({ value }) => normalizarTipoComponente(value))
  @IsNotEmpty({ message: 'El tipo de componente es obligatorio' })
  @IsEnum(TipoComponente, {
    message: `El tipo de componente debe ser uno de: ${Object.values(TipoComponente).join(', ')}`,
  })
  readonly tipo_componente: TipoComponente;

  @ApiProperty({
    description: 'Marca y modelo del componente nuevo',
    example: 'Samsung 970 EVO 1TB',
    maxLength: 150,
  })
  @Transform(recortar)
  @IsString({ message: 'La marca y modelo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca y modelo es obligatoria' })
  @MaxLength(150, {
    message: 'La marca y modelo no puede exceder los 150 caracteres',
  })
  readonly marca_modelo: string;

  @ApiProperty({
    description: 'Número de serie del componente nuevo',
    example: 'SN-SSD-2026-00789',
    maxLength: 100,
  })
  @Transform(recortar)
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de serie es obligatorio' })
  @MaxLength(100, {
    message: 'El número de serie no puede exceder los 100 caracteres',
  })
  readonly numero_serie: string;

  @ApiPropertyOptional({
    description: 'Proveedor o distribuidor del componente nuevo',
    example: 'Tecnoglobal S.A.C.',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(recortarOUndefined)
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  @MaxLength(150, {
    message: 'El proveedor no puede exceder los 150 caracteres',
  })
  readonly proveedor?: string;

  @ApiPropertyOptional({
    description: 'Fecha de compra del componente nuevo (ISO 8601)',
    example: '2026-10-05',
  })
  @IsOptional()
  @Transform(recortarOUndefined)
  @IsDateString(
    { strict: true },
    { message: 'La fecha de compra debe ser una fecha válida (ISO 8601)' },
  )
  readonly fecha_compra?: string;

  @ApiPropertyOptional({
    description: 'Ruta o nombre del archivo de la factura de compra',
    example: 'facturas/fac-001.pdf',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(recortarOUndefined)
  @IsString({ message: 'La factura debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La factura no puede exceder los 255 caracteres',
  })
  readonly url_factura?: string;

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
