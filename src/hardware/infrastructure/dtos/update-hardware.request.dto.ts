import { UpdateHardwareDto } from '@/hardware/application/dtos/update-hardware.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateHardwareRequestDto implements UpdateHardwareDto {
  @ApiPropertyOptional({
    description: 'Tipo o categoría de equipo',
    example: 'Laptop ThinkPad',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de equipo debe ser una cadena de texto' })
  tipo_equipo?: string;

  @ApiPropertyOptional({
    description: 'Número de serie único del hardware',
    example: 'SN-9876543210-REV2',
  })
  @IsOptional()
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  numero_serie?: string;

  @ApiPropertyOptional({
    description: 'Fecha de compra del equipo',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de compra debe ser una fecha válida (ISO 8601)' },
  )
  fecha_compra?: Date;

  @ApiPropertyOptional({
    description: 'Marca del fabricante',
    example: 'Lenovo',
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  marca?: string;

  @ApiPropertyOptional({
    description: 'Proveedor o distribuidor del equipo',
    example: 'TechSupply Peru S.A.C.',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'URL del comprobante o factura digital',
    example: 'https://storage.empresa.com/facturas/fac-001-updated.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la factura debe ser una URL válida' })
  url_factura?: string;

  @ApiPropertyOptional({
    description: 'Descripción o especificaciones técnicas',
    example: 'Core i7 13va Gen, 32GB RAM, SSD 1TB',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Fecha de la última revisión técnica',
    example: '2026-06-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La última revisión debe ser una fecha válida (ISO 8601)' },
  )
  ult_revision?: Date;

  @ApiPropertyOptional({
    description: 'Fecha programada para la siguiente revisión',
    example: '2026-12-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La revisión programada debe ser una fecha válida (ISO 8601)' },
  )
  rev_programada?: Date;
}