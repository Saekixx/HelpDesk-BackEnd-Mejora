import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { GetClientesFilterDto } from '@/clientes/domain/dto/get-clientes-filter.dto';
import {
  EstadoCliente,
  TipoCliente,
} from '@/clientes/domain/entities/cliente.entity';

export class GetClientesQueryDto implements GetClientesFilterDto {
  @ApiPropertyOptional({
    description:
      'Búsqueda parcial por nombre/razón social, documento (RUC/DNI) o correo',
    example: 'Acme',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: TipoCliente,
    description: 'Filtrar por tipo de cliente',
    example: TipoCliente.JURIDICA,
  })
  @IsOptional()
  @IsEnum(TipoCliente, {
    message: 'El tipo de cliente debe ser JURIDICA o NATURAL',
  })
  tipo_cliente?: TipoCliente;

  @ApiPropertyOptional({
    enum: ['activo', 'inactivo'],
    description:
      'Filtrar por estado ("activo" | "inactivo"). Si se omite, retorna ambos.',
    example: 'activo',
  })
  @IsOptional()
  @IsIn(['activo', 'inactivo'], {
    message: 'El estado debe ser "activo" o "inactivo"',
  })
  estado?: EstadoCliente;

  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
    default: 1,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página (máximo 100)',
    default: 10,
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
