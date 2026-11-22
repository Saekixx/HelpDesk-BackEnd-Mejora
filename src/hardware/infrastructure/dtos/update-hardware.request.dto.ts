import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { UpdateHardwareDto } from '@/hardware/application/dtos/update-hardware.dto';
import {
  normalizarTipoComponente,
  TIPO_COMPONENTE_LABEL,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';

// Recorta espacios en textos; deja intacto cualquier otro tipo para que lo
// rechace el validador correspondiente.
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Máximo de la columna hardware.costo_unitario: Decimal(10, 2).
const COSTO_UNITARIO_MAX = 99_999_999.99;

// Body de PATCH /hardware/:id. Todos los campos son opcionales (actualización
// parcial). Los límites de longitud siguen el schema de Prisma:
// numero_serie VarChar(100), marca_modelo y proveedor VarChar(150),
// url_factura VarChar(255).
export class UpdateHardwareRequestDto implements UpdateHardwareDto {
  @ApiPropertyOptional({
    description: `Tipo de componente. Acepta la clave del enum o la etiqueta del modal: ${Object.values(TIPO_COMPONENTE_LABEL).join(', ')}`,
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.ALMACENAMIENTO_SSD,
  })
  @IsOptional()
  @Transform(({ value }) => normalizarTipoComponente(value))
  @IsEnum(TipoComponente, {
    message: `El tipo de componente debe ser uno de: ${Object.values(TipoComponente).join(', ')}`,
  })
  tipo_componente?: TipoComponente;

  @ApiPropertyOptional({
    description: 'Número de serie del hardware',
    example: 'SN-9876543210-REV2',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de serie no puede estar vacío' })
  @MaxLength(100, {
    message: 'El número de serie no puede superar los 100 caracteres',
  })
  numero_serie?: string;

  @ApiPropertyOptional({
    description: 'Marca y modelo del componente',
    example: 'Samsung 980 Pro 1TB',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La marca y modelo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca y modelo no puede estar vacía' })
  @MaxLength(150, {
    message: 'La marca y modelo no puede superar los 150 caracteres',
  })
  marca_modelo?: string;

  @ApiPropertyOptional({
    description: 'Proveedor o distribuidor del componente',
    example: 'TechSupply Peru S.A.C.',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  @MaxLength(150, {
    message: 'El proveedor no puede superar los 150 caracteres',
  })
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Fecha de compra (ISO 8601)',
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de compra debe ser una fecha válida (ISO 8601)' },
  )
  fecha_compra?: string;

  @ApiPropertyOptional({
    description: 'Costo unitario (máximo 2 decimales)',
    example: 350.5,
    minimum: 0,
    maximum: COSTO_UNITARIO_MAX,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'El costo unitario debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  @Max(COSTO_UNITARIO_MAX, {
    message: `El costo unitario no puede superar ${COSTO_UNITARIO_MAX}`,
  })
  costo_unitario?: number;

  @ApiPropertyOptional({
    description: 'Ruta o nombre del archivo de la factura de compra',
    example: 'facturas/fac-001.pdf',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La factura debe ser una cadena de texto' })
  @MaxLength(255, {
    message: 'La factura no puede superar los 255 caracteres',
  })
  url_factura?: string;
}
