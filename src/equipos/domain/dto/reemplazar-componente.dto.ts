// src/equipos/domain/dto/reemplazar-componente.dto.ts

// Contrato de dominio para registrar el reemplazo de un componente de hardware
// de un equipo. El id del equipo se recibe por separado (parámetro de ruta).
export interface ReemplazarComponenteDto {
  id_RH_saliente: number;
  id_hardware_nuevo: number;
  serie: string;
  proveedor: string;
  descripcion: string;
}