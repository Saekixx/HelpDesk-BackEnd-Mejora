import { TicketState } from './ticket-state.interface';
import { Ticket } from '../ticket.entity';
import { CerradoState } from './cerrado.state';
import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';
import { DerivadoInsituState } from './derivado-insitu.state';

export class EnProgresoState implements TicketState {
  readonly name = 'En Progreso';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    // Permite reasignar soporte en caliente durante la atención
    ticket.setIdSoporte(idSoporte);
  }

  iniciarChat(): void {
    // El chat ya está activo, no requiere cambio de estado
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  reabrir(): void {
    throw new InvalidStateTransitionException(this.name, 'reabrir');
  }

  derivarInsitu(ticket: Ticket): void {
    ticket.changeState(new DerivadoInsituState());
  }
}
