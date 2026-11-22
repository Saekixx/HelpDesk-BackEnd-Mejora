import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UpdateSucursalEncargadoCommand } from '@/clientes/domain/dto/update-sucursal.dto';

// Datos actualizables del encargado local de la sucursal. Todos son opcionales;
// los que se envían no pueden ir vacíos. Los límites de longitud son los mismos
// del alta (CreateSucursalEncargadoDto) y siguen el schema de Prisma:
// usuarios.nombre/apellido VarChar(50), usuarios.telefono VarChar(15) y
// usuarios.correo VarChar(255).
export class UpdateSucursalEncargadoDto implements UpdateSucursalEncargadoCommand {
  @ApiPropertyOptional({
    description: 'Nombre del encargado',
    example: 'María',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del encargado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del encargado no puede estar vacío' })
  @MaxLength(50, {
    message: 'El nombre del encargado no puede superar los 50 caracteres',
  })
  readonly nombre?: string;

  @ApiPropertyOptional({
    description: 'Apellido del encargado',
    example: 'Gómez',
  })
  @IsOptional()
  @IsString({
    message: 'El apellido del encargado debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'El apellido del encargado no puede estar vacío' })
  @MaxLength(50, {
    message: 'El apellido del encargado no puede superar los 50 caracteres',
  })
  readonly apellido?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del encargado',
    example: '987654321',
    maxLength: 15,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono de contacto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono de contacto no puede estar vacío' })
  @MaxLength(15, {
    message: 'El teléfono de contacto no puede superar los 15 caracteres',
  })
  readonly telefono_contacto?: string;

  @ApiPropertyOptional({
    description: 'Correo corporativo del encargado',
    example: 'maria.gomez@acme.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo corporativo debe ser válido' })
  @MaxLength(255, {
    message: 'El correo corporativo no puede superar los 255 caracteres',
  })
  readonly correo_corporativo?: string;
}
