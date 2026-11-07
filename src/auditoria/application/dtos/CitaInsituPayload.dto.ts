// DTO para registrar un evento de auditoría al cerrar un ticket
export interface CitaInsituPayloadDto {
  id_cita: number;
  fecha_programada: string;
  estado_cita: string;
  observaciones: string; // Diagnóstico físico, insumos o piezas utilizadas
  id_tecnico: number;
}
