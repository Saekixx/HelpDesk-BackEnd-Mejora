import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UpdateHardwareDto } from '@/hardware/application/dtos/update-hardware.dto';
import {
  normalizarTipoComponente,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateHardwareRequestDto implements UpdateHardwareDto {
  @ApiPropertyOptional({
    description: 'Tipo de componente',
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
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  numero_serie?: string;

  @ApiPropertyOptional({
    description: 'Marca y modelo del componente',
    example: 'Samsung 980 Pro 1TB',
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La marca y modelo debe ser una cadena de texto' })
  marca_modelo?: string;

  @ApiPropertyOptional({
    description: 'Proveedor o distribuidor del componente',
    example: 'TechSupply Peru S.A.C.',
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
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
  costo_unitario?: number;

  @ApiPropertyOptional({
    description: 'Ruta o nombre del archivo de la factura de compra',
    example: 'facturas/fac-001.pdf',
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La factura debe ser una cadena de texto' })
  url_factura?: string;
}
