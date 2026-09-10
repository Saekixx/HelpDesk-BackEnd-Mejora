import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  apellido?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico institucional o personal',
    example: 'juan.perez@empresa.com',
  })
  @IsOptional()
  @IsEmail(
    {},
    { message: 'El correo electrónico debe ser una dirección válida' },
  )
  correo?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono de contacto',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiPropertyOptional({
    description:
      'Indica si se restablece la contraseña del usuario a la clave por defecto (123456)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'resetPassword debe ser un valor booleano' })
  resetPassword?: boolean;

  @ApiPropertyOptional({
    description: 'ID del rol asignado',
    example: 2,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de rol debe ser un número entero' })
  id_rol?: number;

  @ApiPropertyOptional({
    description: 'ID del cliente o empresa (requerido para ciertos roles)',
    example: 10,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de cliente debe ser un número entero' })
  id_cliente?: number | null;

  @ApiPropertyOptional({
    description:
      'ID de la sucursal (requerido para roles de sucursal o trabajador)',
    example: 4,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de sucursal debe ser un número entero' })
  id_sucursal?: number | null;

  @ApiPropertyOptional({
    description: 'ID del área (requerido para el rol CLIENTE_TRABAJADOR)',
    example: 12,
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El ID de área debe ser un número entero' })
  id_area?: number | null;
}
