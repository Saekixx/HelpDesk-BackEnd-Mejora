import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AutoAssignPendingTicketsUseCase } from '@/tickets/application/use-cases/auto-assign-pending-tickets.use-case';
import { TicketsGateway } from '@/tickets/infrastructure/websocket/tickets.gateway';

/**
 * Servicio de Cron para la autoasignación de tickets pendientes.
 * Este servicio se ejecuta automáticamente cada minuto y utiliza el caso de uso
 * AutoAssignPendingTicketsUseCase para asignar tickets pendientes a técnicos de soporte remoto.
 */

@Injectable()
export class TicketsCronService {
  private readonly logger = new Logger(TicketsCronService.name);

  constructor(
    // Inyección del caso de uso para la autoasignación de tickets pendientes
    private readonly autoAssignUseCase: AutoAssignPendingTicketsUseCase,
    // Inyección del TicketsGateway para enviar notificaciones en tiempo real
    private readonly ticketsGateway: TicketsGateway,
  ) {}

  // Se ejecuta automáticamente cada minuto
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCronAutoAsignacion() {
    try {
      // Llamada al caso de uso para autoasignar tickets pendientes
      const ticketsAsignados = await this.autoAssignUseCase.execute();

      // Si no se asignaron tickets, no hacemos nada
      if (ticketsAsignados.length === 0) return;

      // Logueamos la autoasignación de tickets
      this.logger.log(`Notificando autoasignación por WebSocket de tickets.`);

      for (const item of ticketsAsignados) {
        // Emitimos a la sala general del dashboard de tickets
        this.ticketsGateway.server
          .to('tickets_dashboard')
          .emit('refresh_tickets_list', {
            ticketId: item.ticketId,
            status: 'asignado',
          });

        // O notificar al soporte específico en su propia sala
        this.ticketsGateway.server
          .to(`user_${item.assignedSupportId}`)
          .emit('ticket_assigned', {
            ticketId: item.ticketId,
            status: 'asignado',
          });
      }
    } catch (error) {
      this.logger.error('Error en Cron de autoasignación:', error);
    }
  }
}
