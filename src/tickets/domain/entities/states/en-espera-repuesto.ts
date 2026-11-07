import { BaseTicketState } from './base-ticket.state';
import { Ticket } from '../ticket.entity';
import { CerradoState } from './cerrado.state';

export class EnEsperaRepuestoState extends BaseTicketState {
  readonly name = 'En Espera Repuesto';

  cerrar(ticket: Ticket): void {
    ticket.changeState(new CerradoState());
  }

  enEsperaRepuesto(): void {
    // Ya se encuentra en este estado
  }
}
