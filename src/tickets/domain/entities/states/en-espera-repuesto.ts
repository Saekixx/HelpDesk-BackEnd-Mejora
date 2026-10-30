import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';
import { Ticket } from '../ticket.entity';
import { CerradoState } from './cerrado.state';
import { TicketState } from './ticket-state.interface';

export class EnEsperaRepuestoState implements TicketState {
  readonly name = 'En Espera de Repuesto';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    throw new InvalidStateTransitionException(this.name, 'asignarSoporte');
  }

  iniciarChat(ticket: Ticket): void {
    // El chat ya esta activo, no requiere cambio de estado
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  reabrir(ticket: Ticket): void {
    throw new InvalidStateTransitionException(this.name, 'reabrir');
  }

  derivarInsitu(ticket: Ticket): void {
    throw new InvalidStateTransitionException(this.name, 'derivarInsitu');
  }

  enEsperaRepuesto(ticket: Ticket): void {
    // El ticket ya se encuentra en estado "En Espera de Repuesto", no requiere cambio de estado
  }
}
