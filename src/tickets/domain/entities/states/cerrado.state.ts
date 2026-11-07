import { BaseTicketState } from './base-ticket.state';
import { Ticket } from '../ticket.entity';
import { ReabiertoState } from './reabierto.state';

export class CerradoState extends BaseTicketState {
  readonly name = 'Cerrado';

  reabrir(ticket: Ticket): void {
    ticket.changeState(new ReabiertoState());
  }
}
