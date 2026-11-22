import { BaseTicketState } from './base-ticket.state';
import { Ticket } from '../ticket.entity';
import { CerradoState } from './cerrado.state';
import { DerivadoInsituState } from './derivado-insitu.state';

export class EnProgresoState extends BaseTicketState {
  readonly name = 'En Progreso';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    ticket.setIdSoporte(idSoporte);
  }

  iniciarChat(): void {
    // El chat ya está activo, no requiere cambio de estado (puede ser no-op o lanzar excepción según estrictez)
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  derivarInsitu(ticket: Ticket): void {
    ticket.changeState(new DerivadoInsituState());
  }
}
