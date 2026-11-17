// src/equipos/domain/dto/montar-componente-stock.dto.ts

// Contrato de dominio para montar en un equipo un componente que está en
// stock. El id del equipo se recibe por separado (parámetro de ruta) y el
// técnico responsable lo toma el controlador del usuario autenticado.
export interface MontarComponenteStockDto {
  id_hardware: number;
  // Fecha de instalación en formato ISO 8601 (ej. "2026-11-17").
  fecha_instalacion: string;
  observaciones?: string;
}
