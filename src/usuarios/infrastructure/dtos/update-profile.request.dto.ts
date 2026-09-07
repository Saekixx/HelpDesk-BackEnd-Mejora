import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateProfileDTO {
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

  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword?: string;
}
