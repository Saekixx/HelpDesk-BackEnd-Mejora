// src/equipos/domain/dto/agregar-componente.dto.ts

// Contrato de dominio para asociar un componente de hardware existente a un
// equipo. El id del equipo se recibe por separado (parámetro de ruta).
export interface AgregarComponenteDto {
  id_hardware: number;
  serie: string;
  proveedor: string;
  descripcion: string;
}