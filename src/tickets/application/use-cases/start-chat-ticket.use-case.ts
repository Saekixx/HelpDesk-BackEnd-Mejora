import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';

@Injectable()
export class StartChatTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(idTicket: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(idTicket);
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${idTicket} no encontrado.`);
    }

    // Cambia al estado En Progreso a través del dominio
    ticket.iniciarChat();

    return await this.ticketRepository.save(ticket);
  }
}
