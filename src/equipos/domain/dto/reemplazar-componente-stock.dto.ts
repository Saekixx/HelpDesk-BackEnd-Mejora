// src/equipos/domain/dto/reemplazar-componente-stock.dto.ts

// Contrato de dominio para reemplazar un componente instalado por otro que
// está en stock. Los ids del equipo y del componente saliente se reciben por
// separado (parámetros de ruta) y el técnico responsable lo toma el
// controlador del usuario autenticado.
export interface ReemplazarComponenteStockDto {
  id_hardware_nuevo: number;
  // Fecha del reemplazo en formato ISO 8601 (ej. "2026-11-17").
  fecha_reemplazo: string;
  // Motivo del reemplazo.
  observaciones?: string;
}
