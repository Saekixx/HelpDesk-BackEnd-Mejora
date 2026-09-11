import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ConfirmRegisterDto {
  @ApiProperty({
    description:
      'Token de verificación de cuenta enviado por correo electrónico',
    example: 'a8f1b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de verificación es obligatorio' })
  token: string;

  @ApiProperty({
    description: 'Contraseña elegida por el usuario para completar el registro',
    example: 'MiContrasenaSegura123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
