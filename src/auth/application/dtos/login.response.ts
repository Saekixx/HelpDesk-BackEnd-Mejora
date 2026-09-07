export interface LoginResponse {
  token: string;
  user: {
    nombre: string;
    apellido: string;
    correo: string;
    role: string;
    id_empresa: number | null;
    id_sucursal: number | null;
    id_area: number | null;
  };
}
