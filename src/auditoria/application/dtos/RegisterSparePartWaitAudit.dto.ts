// DTO para registrar un evento de auditoría cuando un ticket entra en estado "En Espera Repuesto"
export interface RegisterSparePartWaitAuditDto {
  id_ticket: number;
  id_usuario: number;
  estado_anterior: string; // 'Derivado InSitu'
  estado_nuevo: string; // 'En Espera Repuesto'
  cita_insitu: {
    id_cita: number;
    fecha_programada: string;
    estado_cita: string; // Ej. 'Completada' o estado final de la visita presencial
    observaciones: string; // Detalle del repuesto requerido y causas del diagnóstico
    id_tecnico: number;
  };
}
