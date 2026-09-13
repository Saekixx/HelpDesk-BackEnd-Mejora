// src/clientes/domain/dto/get-clientes-filter.dto.ts

// Criterio de filtro de dominio para el listado paginado de clientes.
// Es un contrato puro (sin decoradores de NestJS ni de Prisma) para mantener
// el dominio desacoplado de la infraestructura.
// Los valores por defecto (page=1, limit=10) se resuelven en la capa que
// consuma este filtro (use case / adaptador de persistencia).
export interface GetClientesFilterDto {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}