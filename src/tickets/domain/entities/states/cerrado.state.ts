import { TicketState } from './ticket-state.interface';
import { Ticket } from '../ticket.entity';
import { ReabiertoState } from './reabierto.state';
import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';

export class CerradoState implements TicketState {
  readonly name = 'Cerrado';

  asignarSoporte(): void {
    throw new InvalidStateTransitionException(this.name, 'asignarSoporte');
  }

  iniciarChat(): void {
    throw new InvalidStateTransitionException(this.name, 'iniciarChat');
  }

  cerrar(): void {
    throw new InvalidStateTransitionException(this.name, 'cerrar');
  }

  reabrir(ticket: Ticket): void {
    ticket.changeState(new ReabiertoState());
  }
}
