import { Ticket } from '../ticket.entity';

export interface TicketState {
  readonly name: string;

  asignarSoporte(ticket: Ticket, idSoporte: number): void;
  iniciarChat(ticket: Ticket): void;
  cerrar(ticket: Ticket): void;
  reabrir(ticket: Ticket): void;
}
