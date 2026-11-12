import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UpdateSoftwareDto } from '@/software/application/dtos/update-software.dto';
import { tipo_licencia_enum, software_estado } from '@prisma/client';

export class UpdateSoftwareRequestDto implements UpdateSoftwareDto {
  @ApiPropertyOptional({
    description: 'Nombre del software',
    example: 'Microsoft Office 365 Enterprise',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre_software?: string;

  @ApiPropertyOptional({
    description: 'Categoría del software',
    example: 'Ofimática',
  })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  categoria?: string;

  @ApiPropertyOptional({
    description: 'ID del cliente dueño del software',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID del cliente debe ser un número' })
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Tipo de licencia',
    enum: tipo_licencia_enum,
    example: 'Pool Limitado',
  })
  @IsOptional()
  @IsEnum(tipo_licencia_enum, { message: 'Tipo de licencia inválido' })
  tipo_licencia?: tipo_licencia_enum;

  @ApiPropertyOptional({
    description: 'Límite de equipos permitidos',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El límite de equipos debe ser numérico' })
  limite_equipos?: number;

  @ApiPropertyOptional({
    description: 'Proveedor o mayorista del software',
    example: 'Microsoft Corporation Inc.',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Fecha de caducidad del software',
    example: '2027-01-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de caducidad debe ser válida (ISO 8601)' },
  )
  fecha_caducidad?: string;

  @ApiPropertyOptional({
    description: 'Clave KMS / master key de la licencia (opcional)',
    example: 'XXXXX-XXXXX-XXXXX',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La clave master debe ser una cadena de texto' })
  licencia_master_key?: string;
}
