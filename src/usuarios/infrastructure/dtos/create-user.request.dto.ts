import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from '@/usuarios/application/dtos/create-user.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserRequestDto implements CreateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  readonly nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  readonly apellido: string;

  @ApiProperty({
    description: 'Correo electrónico corporativo o personal',
    example: 'juan.perez@empresa.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  readonly correo: string;

  @ApiProperty({
    description: 'Número telefónico de contacto',
    example: '+51987654321',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  readonly telefono: string;

  @ApiProperty({
    description: 'ID del rol asignado',
    example: 2,
  })
  @IsNumber({}, { message: 'El ID de rol debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de rol es obligatorio' })
  readonly id_rol: number;

  @ApiPropertyOptional({
    description: 'ID del cliente asociado',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de cliente debe ser un número entero' })
  readonly id_cliente?: number;

  @ApiPropertyOptional({
    description: 'ID de la sucursal asignada',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de sucursal debe ser un número entero' })
  readonly id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'ID del área a la que pertenece',
    example: 3,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de área debe ser un número entero' })
  readonly id_area?: number;
}
