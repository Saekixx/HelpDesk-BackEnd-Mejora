import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Ticket } from '../../domain/entities/ticket.entity';
import {
  TICKET_REPOSITORY,
  TicketRepositoryPort,
} from '../../domain/ports/ticket.repository.port';

@Injectable()
export class StartChatTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(idTicket: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(idTicket);

    if (!ticket) {
      throw new NotFoundException(`El ticket #${idTicket} no existe.`);
    }

    // Transiciona de Asignado / Reabierto a 'En Progreso'
    ticket.iniciarChat();

    return await this.ticketRepository.save(ticket);
  }
}
