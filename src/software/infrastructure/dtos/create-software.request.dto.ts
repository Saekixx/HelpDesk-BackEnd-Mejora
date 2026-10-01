import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateSoftwareDto } from '@/software/application/dtos/create-software.dto';

export class CreateSoftwareRequestDto implements CreateSoftwareDto {
  @ApiProperty({
    description: 'Nombre del software o licencia',
    example: 'Microsoft Office 365',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del software es obligatorio' })
  nombre_software: string;

  @ApiProperty({
    description: 'Código o clave de licencia',
    example: 'XXXXX-XXXXX-XXXXX-XXXXX',
  })
  @IsString({ message: 'La licencia debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La licencia es obligatoria' })
  licencia: string;

  @ApiProperty({
    description: 'Correo asociado a la cuenta o licencia',
    example: 'soporte@empresa.com',
  })
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @ApiProperty({
    description: 'Contraseña o credenciales de acceso (opcional)',
    example: 'P@ssword123!',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password?: string;

  @ApiProperty({
    description: 'Fecha en la que se instaló o adquirió el software',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsDateString(
    {},
    { message: 'La fecha de instalación debe ser una fecha válida (ISO 8601)' },
  )
  @IsNotEmpty({ message: 'La fecha de instalación es obligatoria' })
  fecha_instalacion: Date;

  @ApiProperty({
    description: 'Fecha de vencimiento de la licencia',
    example: '2027-01-15T00:00:00.000Z',
  })
  @IsDateString(
    {},
    { message: 'La fecha de caducidad debe ser una fecha válida (ISO 8601)' },
  )
  @IsNotEmpty({ message: 'La fecha de caducidad es obligatoria' })
  fecha_caducidad: Date;

  @ApiProperty({
    description: 'Proveedor o distribuidor del software',
    example: 'Microsoft Corporation',
  })
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El proveedor es obligatorio' })
  proveedor: string;
}