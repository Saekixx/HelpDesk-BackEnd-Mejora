import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SucursalAnidadaDto } from '@/clientes/domain/dto/sucursal-anidada.dto';

// Sucursal enviada de forma anidada en el body de POST /clientes (o como
// sucursal adicional nueva en PUT /clientes/:id). Solo "nombre" es
// obligatorio.
export class SucursalAnidadaHttpDto implements SucursalAnidadaDto {
  @ApiProperty({
    description: 'Nombre de la sucursal',
    example: 'Sucursal Central',
  })
  @IsString({ message: 'El nombre de la sucursal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
  readonly nombre: string;

  @ApiPropertyOptional({
    description: 'Nombre del encargado de la sucursal',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El encargado debe ser una cadena de texto' })
  readonly encargado?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la sucursal',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  readonly telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo de contacto de la sucursal',
    example: 'sucursal.central@acme.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly correo?: string;

  @ApiPropertyOptional({
    description: 'Dirección de la sucursal',
    example: 'Jr. Los Pinos 456',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  readonly direccion?: string;
}

// Variante para PUT /clientes/:id: todos los campos opcionales, incluido
// "nombre" — se usa para actualizar parcialmente la sucursal principal
// ya existente del cliente.
export class UpdateSucursalAnidadaHttpDto extends PartialType(
  SucursalAnidadaHttpDto,
) {}