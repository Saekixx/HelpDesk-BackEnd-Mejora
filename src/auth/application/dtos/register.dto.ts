export interface RegisterCommand {
  nombre: string;
  correo: string;
  password: string;
  apellido: string;
  telefono: string;
  id_rol: number;
  id_cliente?: number | null;
  id_sucursal?: number | null;
  id_area?: number | null;
}
