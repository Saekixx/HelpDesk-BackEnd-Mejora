import { TicketState } from './ticket-state.interface';
import { Ticket } from '../ticket.entity';
import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';

export abstract class BaseTicketState implements TicketState {
  abstract readonly name: string;

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    throw new InvalidStateTransitionException(this.name, 'asignarSoporte');
  }

  iniciarChat(ticket: Ticket): void {
    throw new InvalidStateTransitionException(this.name, 'iniciarChat');
  }

  cerrar(ticket: Ticket): void {
    throw new InvalidStateTransitionException(this.name, 'cerrar');
  }

  reabrir(ticket: Ticket): void {
    throw new InvalidStateTransitionException(this.name, 'reabrir');
  }

  derivarInsitu(ticket: Ticket): void {
    throw new InvalidStateTransitionException(this.name, 'derivarInsitu');
  }

  enEsperaRepuesto(ticket: Ticket): void {
    throw new InvalidStateTransitionException(this.name, 'enEsperaRepuesto');
  }
}
