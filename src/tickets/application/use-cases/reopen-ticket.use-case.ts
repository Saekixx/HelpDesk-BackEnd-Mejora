import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Ticket } from '../../domain/entities/ticket.entity';
import {
  TICKET_REPOSITORY,
  TicketRepositoryPort,
} from '../../domain/ports/ticket.repository.port';
import { ReopenTicketCommand } from '../dtos/reopen-ticket.request';

@Injectable()
export class ReopenTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(command: ReopenTicketCommand): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(command.id_ticket);

    if (!ticket) {
      throw new NotFoundException(`El ticket #${command.id_ticket} no existe.`);
    }

    if (!ticket.puedeSerReabiertoPor(command.usuario_id, command.rol_usuario)) {
      throw new ForbiddenException(
        'Solo el cliente que creó el ticket o un Administrador pueden reabrirlo.',
      );
    }

    ticket.reabrir();

    return await this.ticketRepository.save(ticket);
  }
}
