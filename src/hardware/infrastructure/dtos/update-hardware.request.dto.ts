import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';
import { UpdateHardwareDto } from '@/hardware/application/dtos/update-hardware.dto';

export class UpdateHardwareRequestDto implements UpdateHardwareDto {
  @ApiPropertyOptional({
    description: 'Tipo o categoría del equipo',
    example: 'Laptop',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de equipo debe ser una cadena de texto' })
  tipo_equipo: string;

  @ApiPropertyOptional({
    description: 'Número de serie único del hardware',
    example: 'SN-987654321',
  })
  @IsOptional()
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  numero_serie: string;

  @ApiPropertyOptional({
    description: 'Fecha de compra del equipo (YYYY-MM-DD)',
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de compra debe ser una fecha válida (YYYY-MM-DD)' },
  )
  fecha_compra: string;

  @ApiPropertyOptional({
    description: 'Marca del fabricante del equipo',
    example: 'Dell',
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  marca: string;

  @ApiPropertyOptional({
    description: 'Nombre de la empresa o proveedor que vendió el equipo',
    example: 'TechSupplier S.A.',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada o especificaciones del hardware',
    example: 'Core i7, 16GB RAM, 512GB SSD',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;
}