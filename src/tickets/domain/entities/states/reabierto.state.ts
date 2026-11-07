import { BaseTicketState } from './base-ticket.state';
import { Ticket } from '../ticket.entity';
import { AsignadoState } from './asignado.state';
import { EnProgresoState } from './en-progreso.state';
import { CerradoState } from './cerrado.state';
import { DerivadoInsituState } from './derivado-insitu.state';

export class ReabiertoState extends BaseTicketState {
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

  derivarInsitu(ticket: Ticket): void {
    ticket.changeState(new DerivadoInsituState());
  }
}
