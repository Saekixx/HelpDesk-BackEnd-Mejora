import { BaseTicketState } from './base-ticket.state';
import { Ticket } from '../ticket.entity';
import { EnProgresoState } from './en-progreso.state';
import { CerradoState } from './cerrado.state';

export class AsignadoState extends BaseTicketState {
  readonly name = 'Asignado';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    // Permite reasignar el soporte técnico mientras está asignado
    ticket.setIdSoporte(idSoporte);
  }

  iniciarChat(ticket: Ticket): void {
    ticket.changeState(new EnProgresoState());
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }
}
