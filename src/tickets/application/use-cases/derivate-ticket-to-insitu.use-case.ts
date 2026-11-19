// src/modules/tickets/application/use-cases/derivate-ticket-to-insitu.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';

@Injectable()
export class DerivateTicketToInSituUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(
    idTicket: number,
  ): Promise<{ ticket: Ticket; estadoAnterior: string }> {
    // 1. Buscar el ticket por su ID
    const ticket = await this.ticketRepository.findById(idTicket);

    // 2. Validar si el ticket existe
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${idTicket} no encontrado.`);
    }

    // 3. Guardar el estado anterior antes de la derivación
    const estadoAnterior = String(ticket.estado);

    // Aplica la regla de negocio en el dominio (conserva id_soporte remoto intacto)
    ticket.derivarInsitu();

    const updatedTicket = await this.ticketRepository.save(ticket);

    return {
      ticket: updatedTicket,
      estadoAnterior,
    };
  }
}
