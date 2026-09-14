// src/clientes/domain/dto/get-clientes-filter.dto.ts

import { TipoCliente } from '../entities/cliente.entity';

// Criterio de filtro de dominio para el listado paginado de clientes.
// Los valores por defecto (page=1, limit=10) se resuelven en la capa que
// consuma este filtro (use case / adaptador de persistencia).
export interface GetClientesFilterDto {
  search?: string;
  tipo_cliente?: TipoCliente;
  is_active?: boolean;
  page?: number;
  limit?: number;
}