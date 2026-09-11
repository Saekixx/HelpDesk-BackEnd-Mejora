import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperación recibido por correo electrónico',
    example: 'd9b2a1c0-3f4e-4e1d-8a2b-9f8e7d6c5b4a',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @ApiProperty({
    description:
      'Nueva contraseña que se asignará a la cuenta (mínimo 6 caracteres)',
    example: 'NuevaContra123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword: string;
}
