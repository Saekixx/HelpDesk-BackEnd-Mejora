import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSucursalDto } from '@/clientes/domain/dto/create-sucursal.dto';
import { CreateSucursalEncargadoDto } from './create-sucursal-encargado.dto';

// Body de POST /sucursales: registra la sucursal y la cuenta de su encargado.
export class CreateSucursalHttpDto implements CreateSucursalDto {
  @ApiProperty({
    description: 'ID del cliente (empresa) al que pertenece la sucursal',
    example: 1,
  })
  @IsInt({ message: 'El ID de cliente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de cliente es obligatorio' })
  readonly id_cliente: number;

  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Centro',
  })
  @IsString({
    message: 'El nombre de la sucursal debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
  @MaxLength(255, {
    message: 'El nombre de la sucursal no puede superar los 255 caracteres',
  })
  readonly nombre_sucursal: string;

  @ApiProperty({
    description: 'Dirección de la sucursal',
    example: 'Jr. Los Pinos 456',
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(255, {
    message: 'La dirección no puede superar los 255 caracteres',
  })
  readonly direccion: string;

  @ApiPropertyOptional({
    description: 'ID de la zona opcional',
    // Explícito: con `number | null` TypeScript emite `Object` y Swagger
    // mostraría el campo como objeto.
    type: Number,
    example: 1,
    nullable: true,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de zona debe ser un número entero' })
  readonly id_zona?: number | null;

  @ApiPropertyOptional({
    description: 'Estado activo de la sucursal',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  readonly is_active?: boolean;

  @ApiProperty({
    description:
      'Encargado local de la sucursal. Se crea su cuenta de usuario junto con la sucursal.',
    type: CreateSucursalEncargadoDto,
  })
  @IsNotEmpty({ message: 'El encargado es obligatorio' })
  @ValidateNested()
  @Type(() => CreateSucursalEncargadoDto)
  readonly encargado: CreateSucursalEncargadoDto;
}
