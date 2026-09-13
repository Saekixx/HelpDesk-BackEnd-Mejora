// src/clientes/domain/dto/get-areas-filter.dto.ts

// Criterio de filtro de dominio para el listado paginado de áreas.
// Es un contrato puro (sin decoradores de NestJS ni de Prisma) para mantener
// el dominio desacoplado de la infraestructura.
// `id_cliente` no es un campo propio de Area (la tabla `area` solo referencia
// `id_sucursal`); se resuelve en la capa de persistencia mediante el join
// area -> sucursal -> cliente, igual que ocurre con `id_cliente` en
// GetSucursalesFilterDto respecto a la tabla `sucursales`.
export interface GetAreasFilterDto {
  id_cliente?: number;
  id_sucursal?: number;
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}