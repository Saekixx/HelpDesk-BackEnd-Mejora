import { EstadoTicket } from '@/tickets/domain/entities/ticket.entity';

export interface CreateTicketDto {
  asunto: string;
  detalle: string;
  estado: EstadoTicket;
  equipoId: number;
  trabajadorId: number;
  soporteId?: number;
  esSoftware?: boolean;
}
