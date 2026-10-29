import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CreateSucursalEncargadoCommand } from '@/clientes/domain/dto/create-sucursal.dto';

// Encargado local de la sucursal. Se crea su cuenta de usuario junto con la
// sucursal. Los límites de longitud siguen el schema de Prisma:
// usuarios.nombre/apellido VarChar(50), usuarios.telefono VarChar(15) y
// usuarios.correo VarChar(255).
export class CreateSucursalEncargadoDto implements CreateSucursalEncargadoCommand {
  @ApiProperty({ description: 'Nombre del encargado', example: 'María' })
  @IsString({ message: 'El nombre del encargado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del encargado es obligatorio' })
  @MaxLength(50, {
    message: 'El nombre del encargado no puede superar los 50 caracteres',
  })
  readonly nombre: string;

  @ApiProperty({ description: 'Apellido del encargado', example: 'Gómez' })
  @IsString({
    message: 'El apellido del encargado debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'El apellido del encargado es obligatorio' })
  @MaxLength(50, {
    message: 'El apellido del encargado no puede superar los 50 caracteres',
  })
  readonly apellido: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto del encargado',
    example: '987654321',
    maxLength: 15,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono de contacto debe ser una cadena de texto' })
  @MaxLength(15, {
    message: 'El teléfono de contacto no puede superar los 15 caracteres',
  })
  readonly telefono_contacto?: string;

  @ApiProperty({
    description: 'Correo corporativo del encargado (será su usuario de acceso)',
    example: 'maria.gomez@acme.com',
  })
  @IsEmail({}, { message: 'El correo corporativo debe ser válido' })
  @IsNotEmpty({ message: 'El correo corporativo es obligatorio' })
  @MaxLength(255, {
    message: 'El correo corporativo no puede superar los 255 caracteres',
  })
  readonly correo_corporativo: string;
}
