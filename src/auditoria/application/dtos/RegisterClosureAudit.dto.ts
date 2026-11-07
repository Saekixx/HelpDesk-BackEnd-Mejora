import { CitaInsituPayloadDto } from './CitaInsituPayload.dto';

// DTO para registrar un evento de auditoría al cerrar un ticket
export interface RegisterClosureAuditDto {
  id_ticket: number;
  id_usuario: number;
  estado_anterior: string;
  estado_nuevo: string; // 'Cerrado'
  tipo_intervencion: 'REMOTO' | 'INSITU';
  reporte_cierre: string;
  motivo_cierre?: string;
  cita_insitu?: CitaInsituPayloadDto; // Opcional si la intervención fue in-situ
}
