// Caso de uso para registrar un evento de auditoría al reabrir un ticket.
export interface RegisterReopeningAuditDto {
  id_ticket: number;
  id_usuario: number;
  estado_anterior: string;
  estado_nuevo: string; // 'Reabierto'
  motivo_reapertura: string;
  ultimo_reporte_cierre?: string;
  // Opcional: si deseas adjuntar o verificar la última cita insitu que tuvo el ticket antes de cerrarse
  ultima_cita_insitu?: {
    id_cita: number;
    fecha_programada: string;
    observaciones_previas: string;
  } | null;
}
