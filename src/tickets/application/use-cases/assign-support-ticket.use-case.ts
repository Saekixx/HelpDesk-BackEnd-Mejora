import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';

export interface AsignarSoporteDto {
  idTicket: number;
  idSoporte: number;
}

@Injectable()
export class AssignSupportTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(dto: AsignarSoporteDto): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(dto.idTicket);
    if (!ticket) {
      throw new NotFoundException(
        `Ticket con ID ${dto.idTicket} no encontrado.`,
      );
    }

    // Ejecuta la lógica de dominio definida en la entidad y su patrón state
    ticket.asignarSoporte(dto.idSoporte);

    // Persiste los cambios usando el método save genérico del puerto
    return await this.ticketRepository.save(ticket);
  }
}
