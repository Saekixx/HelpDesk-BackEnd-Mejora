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

@Injectable()
export class AutoAssignPendingTicketsUseCase {
  private readonly logger = new Logger(AutoAssignPendingTicketsUseCase.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(): Promise<void> {
    const UMBLAR_MINUTOS = 2; // Umbral de tiempo establecido

    // 1. Buscar tickets pendientes que superen los 2 minutos de creación
    const ticketsPendientes =
      await this.ticketRepository.findPendientesParaAutoAsignacion(
        UMBLAR_MINUTOS,
      );

    if (ticketsPendientes.length === 0) {
      return;
    }

    this.logger.log(
      `Se encontraron ${ticketsPendientes.length} tickets pendientes listos para autoasignación.`,
    );

    // 2. Obtener los técnicos de soporte remoto junto con su carga laboral actual
    const tecnicosRemotos =
      await this.userRepository.findRemoteTechniciansWithWorkload(
        UserRole.SOPORTE_TECNICO,
      );

    if (tecnicosRemotos.length === 0) {
      this.logger.warn(
        'No hay técnicos de soporte remoto activos disponibles para la autoasignación.',
      );
      return;
    }

    // 3. Iterar cada ticket pendiente y asignarlo al técnico con menor carga
    for (const ticket of ticketsPendientes) {
      // Ordenar de menor a mayor carga de trabajo (carga_actual ASC)
      tecnicosRemotos.sort((a, b) => a.carga_actual - b.carga_actual);

      // El técnico en la primera posición es el que menos carga tiene
      const tecnicoElegido = tecnicosRemotos[0];

      try {
        // Ejecutar la regla de dominio para asignar soporte (Cambia estado a 'Asignado' e inyecta id_soporte)
        ticket.asignarSoporte(tecnicoElegido.id_usuario);

        // Guardar en la base de datos
        await this.ticketRepository.save(ticket);

        // Incrementar localmente la carga del técnico elegido en memoria
        // para que el siguiente ticket del loop considere este nuevo peso si hay varios pendientes
        tecnicoElegido.carga_actual += 1;

        this.logger.log(
          `Ticket ID ${ticket.id_tickets} (PIN: ${ticket.pin}) autoasignado exitosamente al técnico ID ${tecnicoElegido.id_usuario} (${tecnicoElegido.nombre}). Carga actual: ${tecnicoElegido.carga_actual}`,
        );
      } catch (error) {
        this.logger.error(
          `Error al autoasignar el ticket ID ${ticket.id_tickets}:`,
          error,
        );
      }
    }
  }
}
