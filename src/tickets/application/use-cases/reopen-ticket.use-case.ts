// src/modules/tickets/application/use-cases/reopen-ticket.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';
import { RegisterReopeningAuditUseCase } from '@/auditoria/application/use-case/register-reopening-audit.use-case';

@Injectable()
export class ReopenTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
    private readonly registerReopeningAuditUseCase: RegisterReopeningAuditUseCase,
  ) {}

  async execute(
    idTicket: number,
    idUsuario: number,
    motivo: string,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(idTicket);
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${idTicket} no encontrado.`);
    }

    // Capturamos el estado y el reporte previo ANTES de mutar la entidad
    const estadoAnterior = String(ticket.estado);
    const ultimoReporteCierre = ticket.reporte_cierre || undefined;

    // Ejecuta la transición de reapertura en el dominio
    ticket.reabrir();
    const updatedTicket = await this.ticketRepository.save(ticket);

    // Registra el evento de auditoría (la cita previa se resuelve internamente)
    await this.registerReopeningAuditUseCase.execute({
      id_ticket: updatedTicket.id_tickets!,
      id_usuario: idUsuario,
      estado_anterior: estadoAnterior,
      estado_nuevo: 'Reabierto',
      motivo_reapertura: motivo,
      ultimo_reporte_cierre: ultimoReporteCierre,
    });

    return updatedTicket;
  }
}
