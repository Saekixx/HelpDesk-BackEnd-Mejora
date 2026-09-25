import { EstadoTicket } from '@/tickets/domain/entities/ticket.entity';

export interface CreateTicketDto {
  asunto: string;
  detalle: string;
  equipoId: number;
  esSoftware?: boolean;
}
