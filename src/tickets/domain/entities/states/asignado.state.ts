import { TicketState } from './ticket-state.interface';
import { Ticket } from '../ticket.entity';
import { EnProgresoState } from './en-progreso.state';
import { CerradoState } from './cerrado.state';
import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';

export class AsignadoState implements TicketState {
  readonly name = 'Asignado';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    // Permite reasignar el soporte técnico mientras está asignado
    ticket.setIdSoporte(idSoporte);
  }

  iniciarChat(ticket: Ticket): void {
    // Al iniciar la conversación pasa a 'En Progreso'
    ticket.changeState(new EnProgresoState());
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  reabrir(): void {
    throw new InvalidStateTransitionException(this.name, 'reabrir');
  }
}
