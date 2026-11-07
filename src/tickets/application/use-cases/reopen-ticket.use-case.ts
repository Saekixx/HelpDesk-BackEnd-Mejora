import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';

export class ReabrirTicketDto {
  motivo_reapertura: string;
}

@Injectable()
export class ReopenTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(idTicket: number, dto: ReabrirTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(idTicket);
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${idTicket} no encontrado.`);
    }

    // Ejecuta la transición de reapertura en el dominio
    ticket.reabrir();

    // Nota: Aquí posteriormente integraremos el registro en la tabla de 'auditoria_eventos'
    // guardando el motivo_reapertura en el payload JSON.

    return await this.ticketRepository.save(ticket);
  }
}
