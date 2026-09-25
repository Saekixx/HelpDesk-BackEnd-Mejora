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
import { CloseTicketCommand } from '../dtos/close-ticket.request';

@Injectable()
export class CloseTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(command: CloseTicketCommand): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(command.id_ticket);

    if (!ticket) {
      throw new NotFoundException(`El ticket #${command.id_ticket} no existe.`);
    }

    if (!ticket.puedeSerCerradoPor(command.usuario_id, command.rol_usuario)) {
      throw new ForbiddenException(
        'No tienes permisos para cerrar este ticket.',
      );
    }

    ticket.cerrar();

    return await this.ticketRepository.save(ticket);
  }
}
