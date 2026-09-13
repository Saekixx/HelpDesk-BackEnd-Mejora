// src/clientes/domain/dto/get-sucursales-filter.dto.ts

// Criterio de filtro de dominio para el listado paginado de sucursales.
// `id_cliente` es opcional a nivel de contrato: la capa de aplicación/HTTP
// decide si lo hace obligatorio (p. ej. cuando el listado se expone
// anidado bajo un cliente específico) o lo deja como filtro libre
// (listado global de sucursales para un administrador).
// Los valores por defecto (page=1, limit=10) se resuelven en la capa que
// consuma este filtro (use case / adaptador de persistencia).
export interface GetSucursalesFilterDto {
  id_cliente?: number;
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}