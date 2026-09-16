import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateHardwareDto } from '@/hardware/application/dtos/create-hardware.dto';

export class CreateHardwareRequestDto implements CreateHardwareDto {
  @ApiProperty({
    description: 'Tipo o categoría del equipo',
    example: 'Laptop',
  })
  @IsString({ message: 'El tipo de equipo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de equipo es obligatorio' })
  tipo_equipo: string;

  @ApiProperty({
    description: 'Número de serie único asignado por el fabricante',
    example: 'SN-987654321',
  })
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de serie es obligatorio' })
  numero_serie: string;

  @ApiProperty({
    description: 'Fecha en la que se adquirió el equipo (Formato ISO)',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de compra debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de compra es obligatoria' })
  fecha_compra: string;

  @ApiProperty({
    description: 'Marca del fabricante',
    example: 'Dell',
  })
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  marca: string;

  @ApiProperty({
    description: 'Empresa o proveedor que vendió el equipo',
    example: 'TechSupplier S.A.',
  })
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  proveedor: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada o especificaciones del equipo',
    example: 'Intel Core i7, 16GB RAM, 512GB SSD',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Fecha del último mantenimiento o revisión técnica realizada',
    example: '2026-06-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de última revisión debe ser una fecha válida' })
  ult_revision?: Date;

  @ApiPropertyOptional({
    description: 'Fecha programada para el siguiente mantenimiento técnico',
    example: '2026-12-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de revisión programada debe ser una fecha válida' })
  rev_programada?: Date;

  @ApiPropertyOptional({
    description: 'Indica si el equipo se encuentra activo en el sistema',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  is_active?: boolean;
}