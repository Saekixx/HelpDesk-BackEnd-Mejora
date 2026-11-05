import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateSoftwareDto } from '@/software/application/dtos/create-software.dto';
import { tipo_licencia_enum } from '@prisma/client';

export class CreateSoftwareRequestDto implements CreateSoftwareDto {
  @ApiProperty({
    description: 'ID del cliente dueño del software (opcional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del cliente debe ser un número' })
  id_cliente?: number;

  @ApiProperty({
    description: 'ID de la sucursal específica (opcional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de la sucursal debe ser un número' })
  id_sucursal?: number;

  @ApiProperty({
    description: 'Nombre del software',
    example: 'Microsoft Office 365',
  })
  @IsString({ message: 'El nombre del software debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del software es obligatorio' })
  nombre_software: string;

  @ApiProperty({
    description: 'Categoría del software',
    example: 'Ofimática',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  categoria?: string;

  @ApiProperty({
    description: 'Tipo de licencia basada en el enum',
    enum: tipo_licencia_enum,
    example: 'Pool_Limitado',
  })
  @IsEnum(tipo_licencia_enum, { message: 'Tipo de licencia inválido' })
  tipo_licencia: tipo_licencia_enum;

  @ApiProperty({
    description: 'Clave maestra de la licencia (opcional)',
    example: 'XXXXX-XXXXX-XXXXX',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La licencia master key debe ser una cadena de texto' })
  licencia_master_key?: string;

  @ApiProperty({
    description: 'Proveedor o distribuidor del software',
    example: 'Microsoft Corporation',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @ApiProperty({
    description: 'Límite de equipos permitidos',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El límite de equipos debe ser numérico' })
  limite_equipos?: number;

  @ApiProperty({
    description: 'URL de la factura o comprobante',
    example: 'https://storage.empresa.com/factura.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La URL de la factura debe ser texto' })
  url_factura?: string;

  @ApiProperty({
    description: 'Fecha de compra del software',
    example: '2026-01-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de compra debe ser válida (ISO 8601)' })
  fecha_compra?: string;

  @ApiProperty({
    description: 'Fecha de caducidad del software',
    example: '2027-01-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de caducidad debe ser válida (ISO 8601)' })
  fecha_caducidad?: string;

  @ApiProperty({
    description: 'Estado activo o inactivo',
    example: true,
    required: false,
  })
  @IsOptional()
  is_active?: boolean;
}