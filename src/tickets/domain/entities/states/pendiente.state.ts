import { BaseTicketState } from './base-ticket.state';
import { Ticket } from '../ticket.entity';
import { AsignadoState } from './asignado.state';
import { CerradoState } from './cerrado.state';

export class PendienteState extends BaseTicketState {
  readonly name = 'Pendiente';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    ticket.setIdSoporte(idSoporte);
    ticket.changeState(new AsignadoState());
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }
}
