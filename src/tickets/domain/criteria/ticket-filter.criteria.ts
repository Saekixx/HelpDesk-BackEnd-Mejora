import { EstadoTicket } from '../entities/ticket.entity';

export interface TicketFilterCriteria {
  search?: string;
  estado?: EstadoTicket;
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  id_trabajador?: number; // Este campo se utiliza para filtrar tickets asignados a un trabajador específico.
  id_soporte?: number; // Este campo se utiliza para filtrar tickets asignados a un técnico de soporte específico.
  page?: number;
  limit?: number;
}
