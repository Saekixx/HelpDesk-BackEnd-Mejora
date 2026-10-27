import { ApiProperty } from '@nestjs/swagger';
import { TipoCliente } from '@/clientes/domain/entities/cliente.entity';

// Plan de soporte asignado al cliente (relación con la tabla planes)
export class PlanSoporteResponseDto {
  @ApiProperty({ description: 'Identificador único del plan', example: 3 })
  id_plan: number;

  @ApiProperty({
    description: 'Tipo/nombre del plan',
    example: 'Tech Enterprise',
  })
  tipo: string;

  @ApiProperty({
    description: 'Servicios incluidos en el plan (texto tal como se guarda)',
    example:
      '["Mantenimiento semanal", "Soporte 24/7", "Asignación de técnico exclusivo"]',
  })
  servicios: string;
}

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
      'Plan de soporte asignado (id_plan, tipo y servicios). null si el cliente no tiene plan.',
    type: PlanSoporteResponseDto,
    nullable: true,
  })
  planSoporte: PlanSoporteResponseDto | null;

  @ApiProperty({
    description: 'Estado del cliente: true (activo) o false (inactivo)',
    type: Boolean,
    example: true,
  })
  is_active: boolean;
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
