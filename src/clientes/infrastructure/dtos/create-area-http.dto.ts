import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { CreateAreaDto } from '@/clientes/domain/dto/create-area.dto';

export class CreateAreaHttpDto implements CreateAreaDto {
  @ApiProperty({
    description: 'Nombre del área',
    example: 'Área de Sistemas',
  })
  @IsString({ message: 'El nombre del área debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del área es obligatorio' })
  readonly nombre_area: string;

  @ApiProperty({
    description: 'Nombre de la persona de contacto del área',
    example: 'María Gómez',
  })
  @IsString({ message: 'El contacto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contacto es obligatorio' })
  readonly contacto: string;

  @ApiProperty({
    description: 'Teléfono de contacto del área',
    example: '+51987654321',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  readonly telefono: string;

  @ApiProperty({
    description: 'Correo de contacto del área',
    example: 'sistemas@acme.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly correo: string;

  @ApiProperty({
    description: 'ID de la sucursal a la que pertenece el área',
    example: 1,
  })
  @IsInt({ message: 'El ID de sucursal debe ser un número entero' })
  readonly id_sucursal: number;

  @ApiPropertyOptional({
    description: 'Estado activo del área',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  readonly is_active?: boolean;
}