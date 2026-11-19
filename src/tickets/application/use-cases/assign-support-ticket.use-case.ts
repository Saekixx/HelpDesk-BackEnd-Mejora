import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';

@Injectable()
export class AssignSupportTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(idTicket: number, idSoporte: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(idTicket);
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${idTicket} no encontrado.`);
    }

    // Asigna el soporte al ticket
    ticket.asignarSoporte(idSoporte);

    // Persiste los cambios usando el método save genérico del puerto
    return await this.ticketRepository.save(ticket);
  }
}
