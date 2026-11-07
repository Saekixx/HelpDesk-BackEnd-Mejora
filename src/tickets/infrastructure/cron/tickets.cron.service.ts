import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AutoAssignPendingTicketsUseCase } from '@/tickets/application/use-cases/auto-assign-pending-tickets.use-case';

/**
 * Servicio de Cron para la autoasignación de tickets pendientes.
 * Este servicio se ejecuta automáticamente cada minuto y utiliza el caso de uso
 * AutoAssignPendingTicketsUseCase para asignar tickets pendientes a técnicos de soporte remoto.
 */

@Injectable()
export class TicketsCronService {
  private readonly logger = new Logger(TicketsCronService.name);

  constructor(
    private readonly autoAssignUseCase: AutoAssignPendingTicketsUseCase,
  ) {}

  // Se ejecuta automáticamente cada minuto
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCronAutoAsignacion() {
    try {
      await this.autoAssignUseCase.execute();
    } catch (error) {
      this.logger.error(
        'Error durante la ejecución del Cron de autoasignación de tickets:',
        error,
      );
    }
  }
}
