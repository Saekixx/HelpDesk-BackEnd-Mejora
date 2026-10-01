import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { UpdateSoftwareDto } from '@/software/application/dtos/update-software.dto';

export class UpdateSoftwareRequestDto implements UpdateSoftwareDto {
  @ApiPropertyOptional({
    description: 'Nombre del software o licencia',
    example: 'Microsoft Office 365 Enterprise',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre_software?: string;

  @ApiPropertyOptional({
    description: 'Código o clave de licencia',
    example: 'YYYYY-YYYYY-YYYYY-YYYYY',
  })
  @IsOptional()
  @IsString({ message: 'La licencia debe ser una cadena de texto' })
  licencia?: string;

  @ApiPropertyOptional({
    description: 'Correo asociado a la cuenta o licencia',
    example: 'admin.soporte@empresa.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe ingresar un correo electrónico válido' })
  correo?: string;

  @ApiPropertyOptional({
    description: 'Contraseña o credenciales de acceso',
    example: 'N3wP@ssword2026!',
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Fecha en la que se instaló o adquirió el software',
    example: '2026-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de instalación debe ser una fecha válida (ISO 8601)' },
  )
  fecha_instalacion?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento de la licencia',
    example: '2027-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de caducidad debe ser una fecha válida (ISO 8601)' },
  )
  fecha_caducidad?: Date;

  @ApiPropertyOptional({
    description: 'Proveedor o distribuidor del software',
    example: 'Microsoft Corporation Inc.',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;
}