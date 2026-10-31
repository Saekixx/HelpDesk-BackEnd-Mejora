import {
  TICKET_REPOSITORY,
  TicketRepositoryPort,
} from '@/tickets/domain/ports/ticket.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TicketDetalleDto } from '../dtos/ticket-detalle.dto';

@Injectable()
export class GetTicketDetalleUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(id: number): Promise<TicketDetalleDto | null> {
    const ticketDetalle = await this.ticketRepository.findDetailById(id);

    if (!ticketDetalle) throw new NotFoundException('Ticket no encontrado');

    return ticketDetalle;
  }
}
