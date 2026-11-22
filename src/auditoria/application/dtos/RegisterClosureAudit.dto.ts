// RegisterClosureAudit.dto.ts
export interface RegisterClosureAuditDto {
  id_ticket: number;
  id_usuario: number;
  estado_anterior: string;
  estado_nuevo: string;
  reporte_cierre: string;
  motivo_cierre?: string;
}
