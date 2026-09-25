import { TicketState } from './ticket-state.interface';
import { Ticket } from '../ticket.entity';
import { AsignadoState } from './asignado.state';
import { EnProgresoState } from './en-progreso.state';
import { CerradoState } from './cerrado.state';
import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';

export class ReabiertoState implements TicketState {
  readonly name = 'Reabierto';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    ticket.setIdSoporte(idSoporte);
    ticket.changeState(new AsignadoState());
  }

  iniciarChat(ticket: Ticket): void {
    ticket.changeState(new EnProgresoState());
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  reabrir(): void {
    throw new InvalidStateTransitionException(this.name, 'reabrir');
  }
}
