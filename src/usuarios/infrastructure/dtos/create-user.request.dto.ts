import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserRequestDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  readonly nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  readonly apellido: string;

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  readonly correo: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  readonly password: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  readonly telefono: string;

  @IsNumber({}, { message: 'El ID de rol debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de rol es obligatorio' })
  readonly id_rol: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de cliente debe ser un número entero' })
  readonly id_cliente?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de sucursal debe ser un número entero' })
  readonly id_sucursal?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de área debe ser un número entero' })
  readonly id_area?: number;
}
