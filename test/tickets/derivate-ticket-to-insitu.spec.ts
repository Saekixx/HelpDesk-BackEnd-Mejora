import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { DerivateTicketToInSituUseCase } from '@/tickets/application/use-cases/derivate-ticket-to-insitu.use-case';
import { EstadoTicket, Ticket } from '@/tickets/domain/entities/ticket.entity';
import { InvalidStateTransitionException } from '@/tickets/domain/exceptions/invalid-state-transition.exception';

import {
  createTicketRepositoryMock,
  TestDomainException,
} from './helpers';

function ticketIn(estado: EstadoTicket, id_soporte?: number | null): Ticket {
  return new Ticket({
    id_tickets: 7,
    pin: '123456',
    asunto: 'Impresora averiada',
    detalle: 'No enciende',
    estado,
    id_equipo: 3,
    id_trabajador: 10,
    id_soporte,
  });
}

describe('DerivateTicketToInSituUseCase', () => {
  it('deriva desde En Progreso, conserva el soporte remoto y devuelve el estado anterior', async () => {
    const repository = createTicketRepositoryMock();
    const ticket = ticketIn(EstadoTicket.EN_PROGRESO, 42);
    repository.findById.mockResolvedValue(ticket);
    repository.save.mockImplementation(async (saved: Ticket) => saved);
    const useCase = new DerivateTicketToInSituUseCase(repository as never);

    const result = await useCase.execute(7);

    expect(result.estadoAnterior).toBe('En Progreso');
    // El nombre del state es 'Derivado Insitu' (minúscula en "Insitu"),
    // distinto del valor del enum 'Derivado InSitu'.
    expect(result.ticket.estado).toBe('Derivado Insitu');
    expect(result.ticket.id_soporte).toBe(42);
    expect(repository.save).toHaveBeenCalledWith(ticket);
  });

  it('también permite derivar desde Reabierto', async () => {
    const repository = createTicketRepositoryMock();
    const ticket = ticketIn(EstadoTicket.REABIERTO, 15);
    repository.findById.mockResolvedValue(ticket);
    repository.save.mockImplementation(async (saved: Ticket) => saved);

    const result = await new DerivateTicketToInSituUseCase(
      repository as never,
    ).execute(7);

    expect(result.estadoAnterior).toBe('Reabierto');
    // El nombre del state es 'Derivado Insitu' (minúscula en "Insitu"),
    // distinto del valor del enum 'Derivado InSitu'.
    expect(result.ticket.estado).toBe('Derivado Insitu');
    expect(result.ticket.id_soporte).toBe(15);
  });

  it('lanza NotFoundException con el mensaje exacto si el ticket no existe', async () => {
    const repository = createTicketRepositoryMock();
    repository.findById.mockResolvedValue(null);
    const useCase = new DerivateTicketToInSituUseCase(repository as never);

    await expect(useCase.execute(999)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(999)).rejects.toThrow(
      'Ticket con ID 999 no encontrado.',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it.each([
    EstadoTicket.PENDIENTE,
    EstadoTicket.ASIGNADO,
    EstadoTicket.CERRADO,
    EstadoTicket.DERIVADO_INSITU,
    EstadoTicket.EN_ESPERA_REPUESTO,
  ])('rechaza la derivación desde el estado %s', async (estado) => {
    const repository = createTicketRepositoryMock();
    const ticket = ticketIn(estado);
    repository.findById.mockResolvedValue(ticket);
    const useCase = new DerivateTicketToInSituUseCase(repository as never);

    await expect(useCase.execute(7)).rejects.toThrow(
      InvalidStateTransitionException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('el mensaje de transición inválida usa el nombre del estado del pattern State', async () => {
    const repository = createTicketRepositoryMock();
    repository.findById.mockResolvedValue(ticketIn(EstadoTicket.PENDIENTE));

    await expect(
      new DerivateTicketToInSituUseCase(repository as never).execute(7),
    ).rejects.toThrow(
      "No se puede realizar la acción 'derivarInsitu' en el estado 'Pendiente'.",
    );
  });

  it('conserva id_soporte=null cuando el ticket remoto aún no tiene técnico', async () => {
    const repository = createTicketRepositoryMock();
    const ticket = ticketIn(EstadoTicket.EN_PROGRESO, null);
    repository.findById.mockResolvedValue(ticket);
    repository.save.mockImplementation(async (saved: Ticket) => saved);

    const result = await new DerivateTicketToInSituUseCase(
      repository as never,
    ).execute(7);

    expect(result.ticket.id_soporte).toBeNull();
  });

  it('propaga DomainException del repositorio sin intentar guardar', async () => {
    const repository = createTicketRepositoryMock();
    repository.findById.mockRejectedValue(
      new TestDomainException('Fallo al leer el ticket', 503),
    );

    await expect(
      new DerivateTicketToInSituUseCase(repository as never).execute(7),
    ).rejects.toThrow('Fallo al leer el ticket');
    expect(repository.save).not.toHaveBeenCalled();
  });
});
