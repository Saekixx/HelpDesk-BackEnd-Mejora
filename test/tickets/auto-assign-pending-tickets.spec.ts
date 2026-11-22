import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoAssignPendingTicketsUseCase } from '@/tickets/application/use-cases/auto-assign-pending-tickets.use-case';
import { EstadoTicket, Ticket } from '@/tickets/domain/entities/ticket.entity';
import { UserRole } from '@/usuarios/domain/enum/user-role.enum';

import {
  createTicketDepsMock,
  createTicketRepositoryMock,
  TestDomainException,
} from './helpers';

function pendingTicket(id?: number, estado = EstadoTicket.PENDIENTE): Ticket {
  return new Ticket({
    id_tickets: id,
    pin: `pin-${id ?? 'sin-id'}`,
    asunto: 'Ticket pendiente',
    detalle: 'Detalle',
    estado,
    id_equipo: 1,
    id_trabajador: 10,
  });
}

function technician(
  id_usuario: number,
  carga_actual: number,
): { id_usuario: number; carga_actual: number } {
  return { id_usuario, carga_actual };
}

describe('AutoAssignPendingTicketsUseCase', () => {
  let loggerSpies: [ReturnType<typeof vi.spyOn>, ReturnType<typeof vi.spyOn>];

  beforeEach(() => {
    loggerSpies = [
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined),
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined),
    ];
  });

  afterEach(() => {
    loggerSpies.forEach((spy) => spy.mockRestore());
  });

  it('busca pendientes con umbral de 2 minutos y retorna [] si no hay ninguno', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findPendientesParaAutoAsignacion.mockResolvedValue([]);
    const useCase = new AutoAssignPendingTicketsUseCase(
      repository as never,
      deps.userRepository as never,
    );

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(repository.findPendientesParaAutoAsignacion).toHaveBeenCalledWith(2);
    expect(deps.userRepository.findRemoteTechniciansWithWorkload).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('retorna [] y no guarda si no hay técnicos SOPORTE_TECNICO', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findPendientesParaAutoAsignacion.mockResolvedValue([
      pendingTicket(1),
    ]);
    deps.userRepository.findRemoteTechniciansWithWorkload.mockResolvedValue([]);
    const useCase = new AutoAssignPendingTicketsUseCase(
      repository as never,
      deps.userRepository as never,
    );

    expect(await useCase.execute()).toEqual([]);
    expect(deps.userRepository.findRemoteTechniciansWithWorkload).toHaveBeenCalledWith(
      UserRole.SOPORTE_TECNICO,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('elige al técnico con menor carga y va incrementando su carga', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findPendientesParaAutoAsignacion.mockResolvedValue([
      pendingTicket(1),
      pendingTicket(2),
      pendingTicket(3),
    ]);
    deps.userRepository.findRemoteTechniciansWithWorkload.mockResolvedValue([
      technician(101, 5),
      technician(102, 1),
      technician(103, 3),
    ]);
    const useCase = new AutoAssignPendingTicketsUseCase(
      repository as never,
      deps.userRepository as never,
    );

    const result = await useCase.execute();

    // 102 empieza con carga 1; tras dos asignaciones llega a 3 y empata
    // con 103, por lo que conserva el primer lugar tras el sort estable.
    expect(result).toEqual([
      { ticketId: 1, assignedSupportId: 102 },
      { ticketId: 2, assignedSupportId: 102 },
      { ticketId: 3, assignedSupportId: 102 },
    ]);
    expect(repository.save).toHaveBeenCalledTimes(3);
  });

  it('en empate de carga conserva el primer técnico del array', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findPendientesParaAutoAsignacion.mockResolvedValue([
      pendingTicket(1),
    ]);
    deps.userRepository.findRemoteTechniciansWithWorkload.mockResolvedValue([
      technician(201, 0),
      technician(202, 0),
    ]);

    const result = await new AutoAssignPendingTicketsUseCase(
      repository as never,
      deps.userRepository as never,
    ).execute();

    expect(result).toEqual([{ ticketId: 1, assignedSupportId: 201 }]);
  });

  it('omite tickets sin id y continúa con los demás', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    const ticket = pendingTicket(2);
    repository.findPendientesParaAutoAsignacion.mockResolvedValue([
      pendingTicket(undefined),
      ticket,
    ]);
    deps.userRepository.findRemoteTechniciansWithWorkload.mockResolvedValue([
      technician(102, 0),
    ]);

    const result = await new AutoAssignPendingTicketsUseCase(
      repository as never,
      deps.userRepository as never,
    ).execute();

    expect(result).toEqual([{ ticketId: 2, assignedSupportId: 102 }]);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('captura errores de transición del dominio y no incluye ese ticket en el resultado', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findPendientesParaAutoAsignacion.mockResolvedValue([
      pendingTicket(1, EstadoTicket.CERRADO),
      pendingTicket(2),
    ]);
    deps.userRepository.findRemoteTechniciansWithWorkload.mockResolvedValue([
      technician(102, 0),
    ]);

    const result = await new AutoAssignPendingTicketsUseCase(
      repository as never,
      deps.userRepository as never,
    ).execute();

    expect(result).toEqual([{ ticketId: 2, assignedSupportId: 102 }]);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('propaga errores del repositorio de tickets', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findPendientesParaAutoAsignacion.mockRejectedValue(
      new TestDomainException('Fallo al consultar pendientes', 503),
    );

    await expect(
      new AutoAssignPendingTicketsUseCase(
        repository as never,
        deps.userRepository as never,
      ).execute(),
    ).rejects.toThrow('Fallo al consultar pendientes');
  });

  it('propaga errores del repositorio de usuarios', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findPendientesParaAutoAsignacion.mockResolvedValue([
      pendingTicket(1),
    ]);
    deps.userRepository.findRemoteTechniciansWithWorkload.mockRejectedValue(
      new TestDomainException('Fallo al consultar técnicos', 503),
    );

    await expect(
      new AutoAssignPendingTicketsUseCase(
        repository as never,
        deps.userRepository as never,
      ).execute(),
    ).rejects.toThrow('Fallo al consultar técnicos');
  });
});
