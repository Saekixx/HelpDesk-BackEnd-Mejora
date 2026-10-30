import { EstadoTicket } from '../entities/ticket.entity';

export interface TicketFilterCriteria {
  search?: string;
  estado?: EstadoTicket;
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  page?: number;
  limit?: number;
}
