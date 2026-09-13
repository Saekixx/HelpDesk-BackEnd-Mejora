import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { CreateSucursalDto } from '@/clientes/domain/dto/create-sucursal.dto';

export class CreateSucursalHttpDto implements CreateSucursalDto {
  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Centro',
  })
  @IsString({
    message: 'El nombre de la sucursal debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
  readonly nombre_sucursal: string;

  @ApiProperty({
    description: 'Nombre del encargado de la sucursal',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El encargado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El encargado es obligatorio' })
  readonly encargado: string;

  @ApiProperty({
    description: 'Teléfono de contacto de la sucursal',
    example: '+51987654321',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  readonly telefono: string;

  @ApiProperty({
    description: 'Dirección de la sucursal',
    example: 'Jr. Los Pinos 456',
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  readonly direccion: string;

  @ApiProperty({
    description: 'Correo de contacto de la sucursal',
    example: 'sucursal.centro@acme.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly correo: string;

  @ApiProperty({
    description: 'ID del cliente (empresa) al que pertenece la sucursal',
    example: 1,
  })
  @IsInt({ message: 'El ID de cliente debe ser un número entero' })
  readonly id_cliente: number;

  @ApiPropertyOptional({
    description: 'Estado activo de la sucursal',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  readonly is_active?: boolean;
}