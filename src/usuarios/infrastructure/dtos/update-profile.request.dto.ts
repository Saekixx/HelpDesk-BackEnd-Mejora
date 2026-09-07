import { UpdateProfileDto } from '@/usuarios/application/dtos/update-profile.dto';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  IsEmail,
} from 'class-validator';

export class UpdateProfileDTO implements UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword?: string;
}
