import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Correo electrónico registrado del usuario',
    example: 'admin@empresa.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser un email válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @ApiProperty({
    description: 'Contraseña de acceso a la cuenta',
    example: '12345678',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
