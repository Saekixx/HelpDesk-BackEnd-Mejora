import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { EstadoTicket, Ticket } from '../../domain/entities/ticket.entity';

import {
  TICKET_REPOSITORY,
  TicketRepositoryPort,
} from '../../domain/ports/ticket.repository.port';

import { CreateTicketDto } from '../dtos/create-ticket.dto';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  // Genera un PIN aleatorio de 6 dígitos
  private generateRandomPin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Garantiza que el PIN generado no exista ya en la base de datos
  private async generateUniquePin(): Promise<string> {
    let pin: string;
    let exists = true;

    while (exists) {
      pin = this.generateRandomPin();
      const existingTicket = await this.ticketRepository.findByPin(pin);
      if (!existingTicket) exists = false;
    }

    return pin!;
  }

  // Ejecuta la lógica de creación de un ticket
  async execute(trabajadorId: number, dto: CreateTicketDto): Promise<Ticket> {
    // Verificamos que el equipo pertenece al trabajador que está creando el ticket
    const isOwned = await this.equipoRepository.isEquipoOwnedByUsuario(
      dto.equipoId,
      trabajadorId,
    );

    if (!isOwned) {
      throw new BadRequestException(
        `El equipo con ID ${dto.equipoId} no pertenece al trabajador con ID ${trabajadorId}.`,
      );
    }

    const pin = await this.generateUniquePin();

    // Mapeamos el DTO a las propiedades que espera la Entidad de Dominio
    const ticket = new Ticket({
      pin,
      asunto: dto.asunto,
      detalle: dto.detalle,
      estado: EstadoTicket.PENDIENTE, // Estado inicial por defecto
      id_equipo: dto.equipoId,
      id_trabajador: trabajadorId,
      id_soporte: null, // Se asignará con el otro endpoint
      es_software: dto.esSoftware ?? false,
    });

    return await this.ticketRepository.save(ticket);
  }
}
