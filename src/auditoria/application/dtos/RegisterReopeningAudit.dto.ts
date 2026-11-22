// RegisterReopeningAudit.dto.ts
export interface RegisterReopeningAuditDto {
  id_ticket: number;
  id_usuario: number;
  estado_anterior: string;
  estado_nuevo: string;
  motivo_reapertura: string;
  ultimo_reporte_cierre?: string;
}
