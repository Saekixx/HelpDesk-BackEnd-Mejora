import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../../domain/ports/ticket.repository.port';
import { TicketParticipant } from '../../../domain/entities/ticket-participant.entity';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<TicketParticipant | null> {
    const ticket = await this.prisma.tickets.findUnique({
      where: { id_tickets: id },
      select: {
        id_tickets: true,
        id_trabajador: true,
        id_soporte: true,
        estado: true,
      },
    });

    if (!ticket) return null;

    return new TicketParticipant(
      ticket.id_tickets,
      ticket.id_trabajador,
      ticket.id_soporte,
      ticket.estado ? ticket.estado : 'pendiente',
    );
  }
}
