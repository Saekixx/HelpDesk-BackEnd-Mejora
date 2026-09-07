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
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  correo: string;

  @IsOptional()
  @IsString()
  apellido: string;

  @IsOptional()
  @IsString()
  telefono: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @IsNumber()
  id_rol: number;

  @IsOptional()
  @IsNumber()
  id_cliente?: number | null;

  @IsOptional()
  @IsNumber()
  id_sucursal?: number | null;

  @IsOptional()
  @IsNumber()
  id_area?: number | null;
}
