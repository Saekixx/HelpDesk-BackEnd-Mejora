// Criterio de filtro de dominio para el listado paginado de usuarios (GET /usuario).
// Los valores por defecto (page=1, limit=10) se resuelven en el repositorio.
export interface UserFilterCriteria {
  // Búsqueda parcial por nombre, apellido, correo o nombre de la empresa
  search?: string;
  // Filtro por nombre del rol (ej. "CLIENTE_EMPRESA")
  rol?: string;
  // Filtro por estado. Si se omite, retorna activos e inactivos
  estado?: 'activo' | 'inactivo';
  page?: number;
  limit?: number;
}
