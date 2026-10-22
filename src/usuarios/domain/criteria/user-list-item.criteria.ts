// Estado legible del usuario (mapeado desde is_active)
export type UserEstado = 'ACTIVO' | 'INACTIVO';

// Ítem del listado de usuarios (GET /usuario)
export interface UserListItemCriteria {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  // Nombre legible del rol (ej. "CLIENTE_EMPRESA", "SOPORTE_TECNICO")
  rol: string;
  // nombre_principal de la empresa vinculada; null si el usuario no pertenece a una
  empresa: string | null;
  sucursal: string | null;
  area: string | null;
  estado: UserEstado;
}
