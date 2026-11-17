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
import { RegistrarInstalarComponenteDto } from '@/equipos/domain/dto/registrar-instalar-componente.dto';
import {
  normalizarTipoComponente,
  TIPO_COMPONENTE_LABEL,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';

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

export class RegistrarInstalarComponenteHttpDto
  implements RegistrarInstalarComponenteDto
{
  @ApiProperty({
    description: `Tipo de componente. Acepta la clave del enum o la etiqueta del modal: ${Object.values(TIPO_COMPONENTE_LABEL).join(', ')}`,
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.MEMORIA_RAM,
  })
  @Transform(({ value }) => normalizarTipoComponente(value))
  @IsNotEmpty({ message: 'El tipo de componente es obligatorio' })
  @IsEnum(TipoComponente, {
    message: `El tipo de componente debe ser uno de: ${Object.values(TipoComponente).join(', ')}`,
  })
  readonly tipo_componente: TipoComponente;

  @ApiProperty({
    description: 'Marca y modelo del componente',
    example: 'Kingston Fury 16GB DDR4',
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
    description: 'Número de serie del componente',
    example: 'SN-RAM-2026-00456',
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
    description: 'Proveedor o distribuidor del componente',
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
    description: 'Fecha de compra del componente (ISO 8601)',
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
    example: 'Componente nuevo instalado por ampliación de memoria',
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
