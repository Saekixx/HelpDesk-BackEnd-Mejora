// src/clientes/domain/dto/create-area.dto.ts

// Contrato de dominio para la creación de un área.
export interface CreateAreaDto {
  nombre_area: string;
  contacto: string;
  telefono: string;
  correo: string;
  id_sucursal: number;
  is_active?: boolean;
}