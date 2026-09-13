// src/clientes/domain/dto/create-sucursal.dto.ts

// Contrato de dominio para la creación de una sucursal.
export interface CreateSucursalDto {
  nombre_sucursal: string;
  encargado: string;
  telefono: string;
  direccion: string;
  correo: string;
  id_cliente: number;
  is_active?: boolean;
}