import { ApiProperty } from '@nestjs/swagger';
import { TipoCliente } from '@/clientes/domain/entities/cliente.entity';

// Item del Listado Avanzado de Clientes (GET /clientes)
export class ClienteListItemResponseDto {
  @ApiProperty({ description: 'Identificador único del cliente', example: 1 })
  id_cliente: number;

  @ApiProperty({
    description: 'Nombre (persona natural) o Razón Social (persona jurídica)',
    example: 'Banco Andino S.A.',
  })
  nombre_principal: string;

  @ApiProperty({
    description: 'Rubro o sector económico del cliente',
    example: 'Sector Financiero & Banca',
  })
  rubro: string;

  @ApiProperty({
    enum: TipoCliente,
    description: 'Tipo de cliente',
    example: TipoCliente.JURIDICA,
  })
  tipo_cliente: TipoCliente;

  @ApiProperty({ description: 'RUC o DNI del cliente', example: '20123456789' })
  numero_documento: string;

  @ApiProperty({
    description: 'Cantidad de sucursales asociadas al cliente',
    example: 3,
  })
  totalSucursales: number;

  @ApiProperty({
    description:
      'Nombre del plan de soporte asignado. null si el cliente no tiene plan.',
    example: 'Plan Premium',
    nullable: true,
    type: String,
  })
  planSoporte: string | null;

  @ApiProperty({
    description: 'Estado actual del cliente',
    enum: ['activo', 'inactivo'],
    example: 'activo',
  })
  estado: 'activo' | 'inactivo';
}

// Metadatos de paginación
export class PaginationMetaResponseDto {
  @ApiProperty({
    description: 'Total de registros que cumplen el filtro',
    example: 42,
  })
  total: number;

  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Registros por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 5 })
  totalPages: number;
}

// Cuerpo de `data` en la respuesta paginada: { data: [...], meta: {...} }
export class PaginatedClientesResponseDto {
  @ApiProperty({ type: [ClienteListItemResponseDto] })
  data: ClienteListItemResponseDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;
}
