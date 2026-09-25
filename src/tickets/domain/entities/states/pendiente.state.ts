import { TicketState } from './ticket-state.interface';
import { Ticket } from '../ticket.entity';
import { AsignadoState } from './asignado.state';
import { CerradoState } from './cerrado.state';
import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';

export class PendienteState implements TicketState {
  readonly name = 'Pendiente';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    ticket.setIdSoporte(idSoporte);
    ticket.changeState(new AsignadoState());
  }

  iniciarChat(): void {
    throw new InvalidStateTransitionException(this.name, 'iniciarChat');
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  reabrir(): void {
    throw new InvalidStateTransitionException(this.name, 'reabrir');
  }
}
