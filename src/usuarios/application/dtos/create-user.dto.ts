export interface CreateUserDto {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
  id_rol: number;
  id_cliente?: number | null;
  id_sucursal?: number | null;
  id_area?: number | null;
}
