import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsEmail,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { UpdateClienteDto } from '@/clientes/application/dto/update-cliente.dto';
import { TipoCliente } from '@/clientes/domain/entities/cliente.entity';

// Todos los campos son opcionales (PATCH semántico).
export class UpdateClienteRequestDto implements UpdateClienteDto {
  @ApiPropertyOptional({ enum: TipoCliente, example: TipoCliente.JURIDICA })
  @IsOptional()
  @IsEnum(TipoCliente, {
    message: 'El tipo de cliente debe ser JURIDICA o NATURAL',
  })
  readonly tipo_cliente?: TipoCliente;

  @ApiPropertyOptional({ example: '20123456789' })
  @IsOptional()
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  readonly numero_documento?: string;

  @ApiPropertyOptional({ example: 'Acme Corp SAC' })
  @IsOptional()
  @IsString({ message: 'El nombre principal debe ser una cadena de texto' })
  readonly nombre_principal?: string;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva 123' })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  readonly direccion?: string;

  @ApiPropertyOptional({ example: '+51987654321' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  readonly telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@acme.com' })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  readonly correo?: string;

  @ApiPropertyOptional({ example: 'Retail' })
  @IsOptional()
  @IsString({ message: 'El rubro debe ser una cadena de texto' })
  readonly rubro?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de inicio de plan debe ser una fecha válida' },
  )
  readonly fecha_inicio_plan?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de finalización de plan debe ser una fecha válida' },
  )
  readonly fecha_finalizacion_plan?: string;

  @ApiPropertyOptional({ example: 1500.5 })
  @IsOptional()
  @IsNumber({}, { message: 'El costo negociado debe ser un número' })
  @Min(0, { message: 'El costo negociado no puede ser negativo' })
  readonly costo_negociado?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt({ message: 'El límite de equipos debe ser un número entero' })
  @Min(0, { message: 'El límite de equipos no puede ser negativo' })
  readonly limite_equipos_contratado?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: 'El ID de plan debe ser un número entero' })
  readonly id_plan?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'is_active debe ser un valor booleano' })
  readonly is_active?: boolean;
}