import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateProfileDto } from '@/usuarios/application/dtos/update-profile.dto';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  IsEmail,
} from 'class-validator';

export class UpdateProfileDTO implements UpdateProfileDto {
  @ApiProperty({
    description:
      'Contraseña actual del usuario (requerida para confirmar cambios)',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiPropertyOptional({
    description: 'Nuevo nombre',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Nuevo apellido',
    example: 'Pérez',
  })
  @IsString()
  @IsOptional()
  apellido?: string;

  @ApiPropertyOptional({
    description: 'Nuevo número de teléfono',
    example: '+51987654321',
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Nuevo correo electrónico',
    example: 'juan.actualizado@empresa.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña (opcional)',
    example: '87654321',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword?: string;
}
