export interface UpdateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  resetPassword?: boolean; // Indica si reestableceremos la contraseña del usuario a la contraseña por defecto
  id_rol: number;
  id_cliente?: number | null;
  id_sucursal?: number | null;
  id_area?: number | null;
}
