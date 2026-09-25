import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Ticket } from '../../domain/entities/ticket.entity';
import {
  TICKET_REPOSITORY,
  TicketRepositoryPort,
} from '../../domain/ports/ticket.repository.port';
import { AssignSupportCommand } from '../dtos/assign-support.request';

@Injectable()
export class AssignSupportTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(command: AssignSupportCommand): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(command.id_ticket);

    if (!ticket) {
      throw new NotFoundException(`El ticket #${command.id_ticket} no existe.`);
    }

    ticket.asignarSoporte(command.id_soporte);

    return await this.ticketRepository.save(ticket);
  }
}
