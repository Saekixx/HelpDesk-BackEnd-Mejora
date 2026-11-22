// RegisterSparePartWaitAudit.dto.ts
export interface RegisterSparePartWaitAuditDto {
  id_ticket: number;
  id_usuario: number;
  estado_anterior: string;
  estado_nuevo: string;
}
