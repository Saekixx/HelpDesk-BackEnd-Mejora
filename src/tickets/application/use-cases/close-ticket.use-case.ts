// src/modules/tickets/application/use-cases/close-ticket.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  TicketRepositoryPort,
  TICKET_REPOSITORY,
} from '../../domain/ports/ticket.repository.port';
import { Ticket } from '@/tickets/domain/entities/ticket.entity';
import { RegisterCloseAuditUseCase } from '@/auditoria/application/use-case/register-close-audit.use-case';
import { CerrarTicketDto } from '../dtos/close-ticket.request';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';

@Injectable()
export class CloseTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
    private readonly registerCloseAuditUseCase: RegisterCloseAuditUseCase,
    private readonly prisma: PrismaService, // Inyectamos prisma (o el repositorio de citas) para buscar los datos internos
  ) {}

  async execute(idTicket: number, dto: CerrarTicketDto): Promise<Ticket> {
    // Buscamos el ticket y su última cita in-situ (si existe) directamente desde la base de datos
    const ticketRecord = await this.prisma.tickets.findUnique({
      where: { id_tickets: idTicket },
      include: {
        citas_soporte: {
          orderBy: { created_at: 'desc' },
          take: 1, // Obtenemos la última cita relacionada si existe
        },
      },
    });

    if (!ticketRecord) {
      throw new NotFoundException(`Ticket con ID ${idTicket} no encontrado.`);
    }

    // Instanciamos la entidad de dominio y guardamos el estado anterior
    const ticket = await this.ticketRepository.findById(idTicket);
    const estadoAnterior = ticket!.estado;

    // Ejecuta la regla de negocio de cierre en el dominio
    ticket!.cerrar(dto.reporte_cierre);
    const updatedTicket = await this.ticketRepository.save(ticket!);

    // El sistema determina automáticamente si hubo una cita in-situ vinculada
    const ultimaCita = ticketRecord.citas_soporte[0] || null;
    const tipoIntervencion = ultimaCita ? 'INSITU' : 'REMOTO';

    // Registra la auditoría de forma completamente autónoma
    await this.registerCloseAuditUseCase.execute({
      id_ticket: updatedTicket.id_tickets as number,
      id_usuario: dto.id_usuario,
      estado_anterior: String(estadoAnterior || 'En_Progreso'),
      estado_nuevo: 'Cerrado',
      tipo_intervencion: tipoIntervencion,
      reporte_cierre: dto.reporte_cierre,
      cita_insitu: ultimaCita
        ? {
            id_cita: ultimaCita.id_cita,
            fecha_programada: ultimaCita.fecha_programada
              .toISOString()
              .split('T')[0],
            estado_cita: String(ultimaCita.estado || 'Completada'),
            observaciones:
              ultimaCita.observaciones || 'Sin observaciones previas en cita.',
            id_tecnico: ultimaCita.id_tecnico,
          }
        : undefined,
    });

    return updatedTicket;
  }
}
