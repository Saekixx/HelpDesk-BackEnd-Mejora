import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UpdateClienteCommand } from '@/clientes/domain/entities/cliente.entity';

// Elimina espacios al inicio y al final antes de validar; así un valor
// compuesto solo por espacios se rechaza como vacío.
const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

// Body de PATCH /clientes/:id (modal de edición de cliente).
// Todos los campos son opcionales (PATCH semántico): solo se actualizan los
// campos enviados. Las longitudes máximas reflejan las columnas de la tabla
// `clientes`.
export class UpdateClienteRequestDto implements UpdateClienteCommand {
  @ApiPropertyOptional({
    description: 'Razón Social (persona jurídica) o nombre del cliente',
    example: 'Acme Corp SAC',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'La razón social debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
  @MaxLength(150, {
    message: 'La razón social no puede exceder los 150 caracteres',
  })
  readonly nombre_principal?: string;

  @ApiPropertyOptional({
    description: 'Número de documento (RUC/DNI)',
    example: '20123456789',
    maxLength: 20,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de documento no puede estar vacío' })
  @MaxLength(20, {
    message: 'El número de documento no puede exceder los 20 caracteres',
  })
  readonly numero_documento?: string;

  @ApiPropertyOptional({
    description: 'Rubro o sector económico',
    example: 'Retail',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(trimString)
  @IsString({ message: 'El rubro debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El rubro no puede estar vacío' })
  @MaxLength(100, { message: 'El rubro no puede exceder los 100 caracteres' })
  readonly rubro?: string;

  @ApiPropertyOptional({
    description: 'ID del plan de soporte contratado',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de plan debe ser un número entero' })
  @Min(1, { message: 'El ID de plan debe ser un número positivo' })
  readonly id_plan?: number;
}
