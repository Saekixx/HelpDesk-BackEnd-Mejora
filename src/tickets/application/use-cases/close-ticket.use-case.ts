// src/modules/tickets/application/use-cases/close-ticket.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';
import { RegisterCloseAuditUseCase } from '@/auditoria/application/use-case/register-close-audit.use-case';

@Injectable()
export class CloseTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
    private readonly registerCloseAuditUseCase: RegisterCloseAuditUseCase,
  ) {}

  async execute(
    idTicket: number,
    idUsuario: number,
    reporte_cierre: string,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(idTicket);

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${idTicket} no encontrado.`);
    }

    // Capturamos el estado anterior ANTES de ejecutar la transición
    const estadoAnterior = String(ticket.estado || 'En_Progreso');

    // Ejecuta la regla de negocio de cierre en el dominio
    ticket.cerrar(reporte_cierre);
    const updatedTicket = await this.ticketRepository.save(ticket);

    // Auditoría resuelve internamente si tuvo cita In-Situ o fue Remoto
    await this.registerCloseAuditUseCase.execute({
      id_ticket: updatedTicket.id_tickets as number,
      id_usuario: idUsuario,
      estado_anterior: estadoAnterior,
      estado_nuevo: 'Cerrado',
      reporte_cierre: reporte_cierre,
    });

    return updatedTicket;
  }
}
