// src/equipos/domain/dto/get-equipos-filter.dto.ts

// Criterio de filtro de dominio para el listado paginado de equipos.
// Los valores por defecto (page=1, limit=10) se resuelven en la capa que
// consuma este filtro (use case / adaptador de persistencia).
export interface GetEquiposFilterDto {
  id_cliente?: number;
  id_sucursal?: number;
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}