export interface CreateTicketDto {
  asunto: string;
  detalle: string;
  equipoId: number;
  esSoftware?: boolean;
}
