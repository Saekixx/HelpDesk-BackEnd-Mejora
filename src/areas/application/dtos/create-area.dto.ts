import { IsNotEmpty, IsOptional, IsString, IsInt, IsEmail, MaxLength } from 'class-validator';

export class CreateAreaDto {
  @IsNotEmpty({ message: 'El ID de la empresa es obligatorio' })
  @IsInt({ message: 'El ID de la empresa debe ser un número entero' })
  id_empresa: number;

  @IsNotEmpty({ message: 'El ID de la sucursal es obligatorio' })
  @IsInt({ message: 'El ID de la sucursal debe ser un número entero' })
  id_sucursal: number;

  @IsNotEmpty({ message: 'El nombre del área es obligatorio' })
  @IsString({ message: 'El nombre del área debe ser una cadena de texto' })
  @MaxLength(150, { message: 'El nombre del área no puede superar los 150 caracteres' })
  nombre_area: string;

  @IsOptional()
  @IsString({ message: 'El contacto responsable debe ser una cadena de texto' })
  @MaxLength(150, { message: 'El contacto responsable no puede superar los 150 caracteres' })
  contacto_responsable?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El teléfono no puede superar los 50 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @MaxLength(150, { message: 'El correo electrónico no puede superar los 150 caracteres' })
  correo_electronico?: string;
}