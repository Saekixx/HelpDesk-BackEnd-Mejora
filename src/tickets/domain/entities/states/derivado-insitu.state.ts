import { BaseTicketState } from './base-ticket.state';
import { Ticket } from '../ticket.entity';
import { CerradoState } from './cerrado.state';
import { EnEsperaRepuestoState } from './en-espera-repuesto';

export class DerivadoInsituState extends BaseTicketState {
  readonly name = 'Derivado Insitu';

  asignarSoporte(ticket: Ticket, idSoporte: number): void {
    ticket.setIdSoporte(idSoporte);
  }

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  enEsperaRepuesto(ticket: Ticket): void {
    ticket.changeState(new EnEsperaRepuestoState());
  }
}
