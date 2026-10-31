import { TicketDetalleCriteria } from '../criteria/ticket-detalle.criteria';
import { TicketFilterCriteria } from '../criteria/ticket-filter.criteria';
import { TicketResponseCriteria } from '../criteria/ticket-response.criteria';
import { Ticket } from '../entities/ticket.entity';

export const TICKET_REPOSITORY = 'TICKET_REPOSITORY';

export interface PaginatedTicketsResult {
  data: TicketResponseCriteria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketRepositoryPort {
  save(ticket: Ticket): Promise<Ticket>;

  findById(id: number): Promise<Ticket | null>;

  findByPin(pin: string): Promise<Ticket | null>;

  findAllWithFilters(
    filters: TicketFilterCriteria,
  ): Promise<PaginatedTicketsResult>;

  findDetailById(id: number): Promise<TicketDetalleCriteria | null>;
}
