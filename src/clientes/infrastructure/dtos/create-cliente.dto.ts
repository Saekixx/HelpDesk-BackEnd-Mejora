import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { CreateClienteDto } from '@/clientes/application/dto/create-cliente.dto';
import { TipoCliente } from '@/clientes/domain/entities/cliente.entity';

export class CreateClienteRequestDto implements CreateClienteDto {
  @ApiProperty({
    enum: TipoCliente,
    description: 'Tipo de cliente',
    example: TipoCliente.JURIDICA,
  })
  @IsEnum(TipoCliente, {
    message: 'El tipo de cliente debe ser JURIDICA o NATURAL',
  })
  readonly tipo_cliente: TipoCliente;

  @ApiProperty({
    description: 'Número de documento (RUC/DNI)',
    example: '20123456789',
  })
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  readonly numero_documento: string;

  @ApiProperty({
    description: 'Nombre o razón social del cliente',
    example: 'Acme Corp SAC',
  })
  @IsString({ message: 'El nombre principal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre principal es obligatorio' })
  readonly nombre_principal: string;

  @ApiProperty({
    description: 'Dirección fiscal',
    example: 'Av. Siempre Viva 123',
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  readonly direccion: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+51987654321',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  readonly telefono: string;

  @ApiProperty({
    description: 'Correo de contacto',
    example: 'contacto@acme.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly correo: string;

  @ApiProperty({ description: 'Rubro o giro de negocio', example: 'Retail' })
  @IsString({ message: 'El rubro debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El rubro es obligatorio' })
  readonly rubro: string;

  @ApiProperty({
    description: 'Fecha de inicio del plan contratado (YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsDateString(
    {},
    { message: 'La fecha de inicio de plan debe ser una fecha válida' },
  )
  readonly fecha_inicio_plan: string;

  @ApiProperty({
    description: 'Fecha de finalización del plan contratado (YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsDateString(
    {},
    { message: 'La fecha de finalización de plan debe ser una fecha válida' },
  )
  readonly fecha_finalizacion_plan: string;

  @ApiProperty({ description: 'Costo negociado con el cliente', example: 1500.5 })
  @IsNumber({}, { message: 'El costo negociado debe ser un número' })
  @Min(0, { message: 'El costo negociado no puede ser negativo' })
  readonly costo_negociado: number;

  @ApiProperty({ description: 'Límite de equipos contratado', example: 20 })
  @IsInt({ message: 'El límite de equipos debe ser un número entero' })
  @Min(0, { message: 'El límite de equipos no puede ser negativo' })
  readonly limite_equipos_contratado: number;

  @ApiProperty({ description: 'ID del plan contratado', example: 1 })
  @IsInt({ message: 'El ID de plan debe ser un número entero' })
  readonly id_plan: number;

  @ApiPropertyOptional({
    description: 'Estado activo del cliente',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  readonly is_active?: boolean;
}