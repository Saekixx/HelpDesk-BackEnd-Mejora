// src/usuarios/application/dtos/user-response.dto.ts

export class UserResponseCriteria {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;

  // IDs
  id_rol: number;
  id_cliente?: number | null;
  id_sucursal?: number | null;
  id_area?: number | null;

  // Rol como objeto { id, nombre } para la UI
  rol: { id: number; nombre: string } | null;

  // Nombres/Textos descriptivos
  nombre_rol?: string;
  nombre_cliente?: string | null;
  nombre_sucursal?: string | null;
  nombre_area?: string | null;
}
