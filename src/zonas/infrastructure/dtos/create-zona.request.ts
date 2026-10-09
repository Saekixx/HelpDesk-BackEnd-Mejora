import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateZonaRequest {
  @ApiProperty({
    description: 'Nombre de la zona asignada al soporte in-situ',
    example: 'Zona Norte - Sede Central',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre de la zona debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la zona es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre de la zona no puede superar los 100 caracteres',
  })
  nombre_zona: string;

  @ApiProperty({
    description:
      'Descripción detallada de la cobertura geográfica o alcance de la zona',
    example:
      'Cubre los edificios A, B y C del campus para la atención de tickets in-situ',
    maxLength: 255,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(255, {
    message: 'La descripción no puede superar los 255 caracteres',
  })
  descripcion: string;
}
