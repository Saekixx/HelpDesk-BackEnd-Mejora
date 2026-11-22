import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  TICKET_REPOSITORY,
  TicketRepositoryPort,
} from '../../../tickets/domain/ports/ticket.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../usuarios/domain/ports/user.repository.port';
import { UserRole } from '@/usuarios/domain/enum/user-role.enum';

/**
 * Caso de uso para la autoasignación de tickets pendientes a técnicos de soporte remoto.
 * Este caso de uso busca tickets que han estado pendientes por más de un umbral de tiempo
 * y los asigna automáticamente al técnico con menor carga de trabajo.
 */

// Define una interfaz limpia o tipo para el resultado
export interface TicketAsignadoDto {
  ticketId: number;
  assignedSupportId: number;
}

@Injectable()
export class AutoAssignPendingTicketsUseCase {
  private readonly logger = new Logger(AutoAssignPendingTicketsUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}
  async execute(): Promise<TicketAsignadoDto[]> {
    const UMBLAR_MINUTOS = 2;
    const ticketsAsignados: TicketAsignadoDto[] = [];

    const ticketsPendientes =
      await this.ticketRepository.findPendientesParaAutoAsignacion(
        UMBLAR_MINUTOS,
      );

    if (ticketsPendientes.length === 0) {
      return []; // Si no hay nada, retorna un array vacío sin romper nada
    }

    const tecnicosRemotos =
      await this.userRepository.findRemoteTechniciansWithWorkload(
        UserRole.SOPORTE_TECNICO,
      );

    if (tecnicosRemotos.length === 0) {
      return [];
    }

    for (const ticket of ticketsPendientes) {
      const ticketId = ticket.id_tickets;

      if (ticketId === undefined) {
        this.logger.error('No se puede autoasignar un ticket sin ID.');
        continue;
      }

      tecnicosRemotos.sort((a, b) => a.carga_actual - b.carga_actual);
      const tecnicoElegido = tecnicosRemotos[0];

      try {
        ticket.asignarSoporte(tecnicoElegido.id_usuario);
        await this.ticketRepository.save(ticket);
        tecnicoElegido.carga_actual += 1;

        // Guardamos en la lista el ticket que SÍ se asignó con éxito
        ticketsAsignados.push({
          ticketId,
          assignedSupportId: tecnicoElegido.id_usuario,
        });

        this.logger.log(
          `Ticket ID ${ticket.id_tickets} autoasignado al técnico ID ${tecnicoElegido.id_usuario}.`,
        );
      } catch (error) {
        this.logger.error(
          `Error al autoasignar el ticket ID ${ticket.id_tickets}:`,
          error,
        );
      }
    }

    // Retornamos los tickets que cambiaron de estado
    return ticketsAsignados;
  }
}
