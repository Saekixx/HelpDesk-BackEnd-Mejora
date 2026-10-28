import { IsNotEmpty, IsOptional, IsString, IsInt, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({
    description: 'ID de la empresa a la que pertenece el área',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio' })
  @IsInt({ message: 'El ID de la empresa debe ser un número entero' })
  id_empresa: number;

  @ApiProperty({
    description: 'ID de la sucursal a la que pertenece el área',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la sucursal es obligatorio' })
  @IsInt({ message: 'El ID de la sucursal debe ser un número entero' })
  id_sucursal: number;

  @ApiProperty({
    description: 'Nombre o descripción del área',
    example: 'Soporte Técnico',
  })
  @IsNotEmpty({ message: 'El nombre del área es obligatorio' })
  @IsString({ message: 'El nombre del área debe ser una cadena de texto' })
  @MaxLength(150, { message: 'El nombre del área no puede superar los 150 caracteres' })
  nombre_area: string;

  @ApiPropertyOptional({
    description: 'Contacto o responsable del área',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El contacto responsable debe ser una cadena de texto' })
  @MaxLength(150, { message: 'El contacto responsable no puede superar los 150 caracteres' })
  contacto_responsable?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del área',
    example: '987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El teléfono no puede superar los 50 caracteres' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del área o responsable',
    example: 'soporte@empresa.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @MaxLength(150, { message: 'El correo electrónico no puede superar los 150 caracteres' })
  correo_electronico?: string;
}