import { CreateHardwareDto } from '@/hardware/application/dtos/create-hardware.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateHardwareRequestDto implements CreateHardwareDto {
  @ApiProperty({
    description: 'Tipo o categoría de equipo',
    example: 'Laptop',
  })
  @IsString({ message: 'El tipo de equipo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de equipo es obligatorio' })
  tipo_equipo: string;

  @ApiProperty({
    description: 'Número de serie único del hardware',
    example: 'SN-9876543210',
  })
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de serie es obligatorio' })
  numero_serie: string;

  @ApiProperty({
    description: 'Fecha de compra del equipo',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDateString(
    {},
    { message: 'La fecha de compra debe ser una fecha válida (ISO 8601)' },
  )
  @IsNotEmpty({ message: 'La fecha de compra es obligatoria' })
  fecha_compra: Date;

  @ApiProperty({
    description: 'Marca del fabricante',
    example: 'Lenovo',
  })
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  marca: string;

  @ApiProperty({
    description: 'Proveedor o distribuidor del equipo',
    example: 'TechSupply Peru S.A.C.',
  })
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  proveedor: string;

  @ApiProperty({
    description: 'URL del comprobante o factura digital (opcional)',
    example: 'https://storage.empresa.com/facturas/fac-001.pdf',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la factura debe ser una URL válida' })
  url_factura?: string;

  @ApiProperty({
    description: 'Descripción o especificaciones técnicas (opcional)',
    example: 'Core i7 13va Gen, 16GB RAM, SSD 512GB',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'Fecha de la última revisión técnica (opcional)',
    example: '2026-06-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La última revisión debe ser una fecha válida (ISO 8601)' },
  )
  ult_revision?: Date;

  @ApiProperty({
    description: 'Fecha programada para la siguiente revisión (opcional)',
    example: '2026-12-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La revisión programada debe ser una fecha válida (ISO 8601)' },
  )
  rev_programada?: Date;
}