// src/clientes/domain/dto/get-clientes-filter.dto.ts

import { EstadoCliente, TipoCliente } from '../entities/cliente.entity';

// Criterio de filtro de dominio para el listado paginado de clientes.
// Los valores por defecto (page=1, limit=10) se resuelven en el caso de uso
// (GetClientesUseCase) antes de llegar al puerto del repositorio.
export interface GetClientesFilterDto {
  // Búsqueda parcial por nombre/razón social, número de documento o correo
  search?: string;
  tipo_cliente?: TipoCliente;
  // "activo" | "inactivo". Si se omite, retorna ambos.
  estado?: EstadoCliente;
  page?: number;
  limit?: number;
}
