// src/modules/auditoria/application/dtos/RegisterDerivationAudit.dto.ts
import { CitaInsituPayloadDto } from './CitaInsituPayload.dto';

export interface RegisterDerivationAuditDto {
  id_ticket: number;
  id_usuario: number; // Usuario que ejecuta la derivación
  id_tecnico_remoto: number | null; // Se obtiene del ticket (id_soporte)
  estado_anterior: string;
  estado_nuevo: string; // 'Derivado_InSitu'
  motivo_derivacion?: string;
  cita_insitu: CitaInsituPayloadDto; // Contiene id_cita, fecha_programada, estado_cita, observaciones e id_tecnico (in-situ)
}
