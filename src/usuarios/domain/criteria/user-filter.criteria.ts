// Criterio de filtro de dominio para el listado paginado de usuarios (GET /usuario).
// Los valores por defecto (page=1, limit=10) se resuelven en el repositorio.
export interface UserFilterCriteria {
  // Búsqueda parcial por nombre, apellido, correo o nombre de la empresa
  search?: string;
  // Filtro por rol: por ID o por nombre (ej. "CLIENTE_EMPRESA"). Si llegan ambos, prevalece id_rol
  id_rol?: number;
  rol?: string;
  // true => activo, false => inactivo. Si se omite, retorna ambos
  is_active?: boolean;
  // Equivalente legible de is_active. Si llegan ambos, prevalece is_active
  estado?: 'activo' | 'inactivo';
  page?: number;
  limit?: number;
}
