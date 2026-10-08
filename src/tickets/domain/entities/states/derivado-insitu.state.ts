import { TicketState } from './ticket-state.interface';
import { Ticket } from '../ticket.entity';
import { CerradoState } from './cerrado.state';
import { InvalidStateTransitionException } from '../../exceptions/invalid-state-transition.exception';

export class DerivadoInsituState implements TicketState {
  readonly name = 'Derivado Insitu';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    // Permite reasignar soporte en caliente durante la atención
    ticket.setIdSoporte(idSoporte);
  }

  iniciarChat(): void {
    // El chat ya está activo, no requiere cambio de estado
  }

  cerrar(ticket: Ticket): void {
    // Cambia el estado del ticket a Cerrado
    ticket.changeState(new CerradoState());
  }

  reabrir(): void {
    // No se permite reabrir un ticket derivado insitu
    throw new InvalidStateTransitionException(this.name, 'reabrir');
  }

  derivarInsitu(): void {
    // No se permite derivar un ticket que ya está en estado Derivado Insitu
    throw new InvalidStateTransitionException(this.name, 'derivarInsitu');
  }
}
