export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  resetPassword?: boolean;
  id_rol?: number;
  id_cliente?: number | null;
  id_sucursal?: number | null;
  id_area?: number | null;
}
