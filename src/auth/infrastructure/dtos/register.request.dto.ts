import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegisterCommand } from '@/auth/application/dtos/register.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto implements RegisterCommand {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Jack',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico corporativo o personal',
    example: 'jack@empresa.com',
  })
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  correo: string;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Hernández',
  })
  @IsOptional()
  @IsString()
  apellido: string;

  @ApiPropertyOptional({
    description: 'Número telefónico de contacto',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString()
  telefono: string;

  @ApiProperty({
    description: 'Contraseña de la cuenta',
    example: '12345678',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'ID del rol asignado al usuario',
    example: 1,
  })
  @IsNumber()
  id_rol: number;

  @ApiPropertyOptional({
    description: 'ID del cliente asociado',
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  id_cliente?: number | null;

  @ApiPropertyOptional({
    description: 'ID de la sucursal asignada',
    example: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  id_sucursal?: number | null;

  @ApiPropertyOptional({
    description: 'ID del área a la que pertenece',
    example: 3,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  id_area?: number | null;
}
