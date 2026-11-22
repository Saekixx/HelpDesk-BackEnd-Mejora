import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { AssignSupportTicketUseCase } from '@/tickets/application/use-cases/assign-support-ticket.use-case';
import { CloseTicketUseCase } from '@/tickets/application/use-cases/close-ticket.use-case';
import { CreateTicketUseCase } from '@/tickets/application/use-cases/create-ticket.use-case';
import { GetTicketDetalleUseCase } from '@/tickets/application/use-cases/get-ticket-detalle.use-case';
import { GetTicketsUseCase } from '@/tickets/application/use-cases/get-tickets.use-case';
import { ReopenTicketUseCase } from '@/tickets/application/use-cases/reopen-ticket.use-case';
import { EstadoTicket, Ticket } from '@/tickets/domain/entities/ticket.entity';

import {
  createTicketDepsMock,
  createTicketRepositoryMock,
  TestDomainException,
} from './helpers';

function buildTicket(estado = EstadoTicket.EN_PROGRESO): Ticket {
  return new Ticket({
    id_tickets: 7,
    pin: '123456',
    asunto: 'Asunto',
    detalle: 'Detalle',
    estado,
    id_equipo: 3,
    id_trabajador: 10,
    id_soporte: 5,
    reporte_cierre: 'Reporte previo',
  });
}

describe('GetTicketsUseCase', () => {
  it('delega los filtros al repositorio sin alterarlos', async () => {
    const repository = createTicketRepositoryMock();
    const filters = { search: 'impresora', page: 2, limit: 5 };
    const expected = {
      data: [],
      total: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
    };
    repository.findAllWithFilters.mockResolvedValue(expected);

    const result = await new GetTicketsUseCase(repository as never).execute(
      filters as never,
    );

    expect(repository.findAllWithFilters).toHaveBeenCalledWith(filters);
    expect(result).toBe(expected);
  });

  it('propaga excepciones del repositorio', async () => {
    const repository = createTicketRepositoryMock();
    repository.findAllWithFilters.mockRejectedValue(
      new TestDomainException('Fallo en listado', 503),
    );

    await expect(
      new GetTicketsUseCase(repository as never).execute({} as never),
    ).rejects.toThrow('Fallo en listado');
  });
});

describe('GetTicketDetalleUseCase', () => {
  it('devuelve el detalle cuando existe', async () => {
    const repository = createTicketRepositoryMock();
    const detalle = { id_tickets: 7, asunto: 'Asunto' };
    repository.findDetailById.mockResolvedValue(detalle);

    await expect(
      new GetTicketDetalleUseCase(repository as never).execute(7),
    ).resolves.toBe(detalle);
    expect(repository.findDetailById).toHaveBeenCalledWith(7);
  });

  it('lanza NotFoundException cuando no hay detalle', async () => {
    const repository = createTicketRepositoryMock();
    repository.findDetailById.mockResolvedValue(null);

    await expect(
      new GetTicketDetalleUseCase(repository as never).execute(999),
    ).rejects.toThrow('Ticket no encontrado');
    await expect(
      new GetTicketDetalleUseCase(repository as never).execute(999),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('CreateTicketUseCase', () => {
  const dto = {
    asunto: 'Impresora averiada',
    detalle: 'No enciende',
    equipoId: 3,
  };

  it('rechaza la creación si el equipo no pertenece al trabajador', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    deps.equipoRepository.isEquipoOwnedByUsuario.mockResolvedValue(false);

    await expect(
      new CreateTicketUseCase(
        repository as never,
        deps.equipoRepository as never,
      ).execute(10, dto as never),
    ).rejects.toThrow(BadRequestException);
    await expect(
      new CreateTicketUseCase(
        repository as never,
        deps.equipoRepository as never,
      ).execute(10, dto as never),
    ).rejects.toThrow(
      'El equipo con ID 3 no pertenece al trabajador con ID 10.',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('crea el ticket en Pendiente con PIN único y es_software=false por defecto', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    deps.equipoRepository.isEquipoOwnedByUsuario.mockResolvedValue(true);
    repository.findByPin
      .mockResolvedValueOnce({ pin: '111111' })
      .mockResolvedValueOnce(null);
    repository.save.mockImplementation(async (ticket: Ticket) => ticket);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = await new CreateTicketUseCase(
      repository as never,
      deps.equipoRepository as never,
    ).execute(10, dto as never);

    expect(repository.findByPin).toHaveBeenCalledTimes(2);
    expect(result.pin).toMatch(/^\d{6}$/);
    expect(result.estado).toBe(EstadoTicket.PENDIENTE);
    expect(result.id_soporte).toBeNull();
    expect(result.es_software).toBe(false);
    expect(result.id_trabajador).toBe(10);
    expect(result.id_equipo).toBe(3);
    expect(repository.save).toHaveBeenCalledWith(result);
    randomSpy.mockRestore();
  });

  it('respeta esSoftware=true y pasa el PIN directo cuando no existe', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    deps.equipoRepository.isEquipoOwnedByUsuario.mockResolvedValue(true);
    repository.findByPin.mockResolvedValue(null);
    repository.save.mockImplementation(async (ticket: Ticket) => ticket);

    const result = await new CreateTicketUseCase(
      repository as never,
      deps.equipoRepository as never,
    ).execute(10, { ...dto, esSoftware: true } as never);

    expect(result.es_software).toBe(true);
    expect(repository.findByPin).toHaveBeenCalledOnce();
  });
});

describe('CloseTicketUseCase', () => {
  it('cierra, guarda y registra auditoría con el estado anterior', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    const ticket = buildTicket(EstadoTicket.EN_PROGRESO);
    repository.findById.mockResolvedValue(ticket);
    repository.save.mockImplementation(async (saved: Ticket) => saved);

    const result = await new CloseTicketUseCase(
      repository as never,
      deps.registerCloseAudit as never,
    ).execute(7, 10, 'Solucionado');

    expect(result.estado).toBe(EstadoTicket.CERRADO);
    expect(result.reporte_cierre).toBe('Solucionado');
    expect(deps.registerCloseAudit.execute).toHaveBeenCalledWith({
      id_ticket: 7,
      id_usuario: 10,
      estado_anterior: 'En Progreso',
      estado_nuevo: 'Cerrado',
      reporte_cierre: 'Solucionado',
    });
  });

  it('lanza NotFoundException y no guarda ni audita si no existe', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findById.mockResolvedValue(null);

    await expect(
      new CloseTicketUseCase(
        repository as never,
        deps.registerCloseAudit as never,
      ).execute(999, 10, 'Solucionado'),
    ).rejects.toThrow('Ticket con ID 999 no encontrado.');
    expect(repository.save).not.toHaveBeenCalled();
    expect(deps.registerCloseAudit.execute).not.toHaveBeenCalled();
  });

  it('propaga errores de la auditoría', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findById.mockResolvedValue(buildTicket());
    repository.save.mockImplementation(async (saved: Ticket) => saved);
    deps.registerCloseAudit.execute.mockRejectedValue(
      new TestDomainException('Fallo de auditoría', 500),
    );

    await expect(
      new CloseTicketUseCase(
        repository as never,
        deps.registerCloseAudit as never,
      ).execute(7, 10, 'Solucionado'),
    ).rejects.toThrow('Fallo de auditoría');
  });
});

describe('ReopenTicketUseCase', () => {
  it('reabre, guarda y audita incluyendo el último reporte de cierre', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    const ticket = buildTicket(EstadoTicket.CERRADO);
    repository.findById.mockResolvedValue(ticket);
    repository.save.mockImplementation(async (saved: Ticket) => saved);

    const result = await new ReopenTicketUseCase(
      repository as never,
      deps.registerReopeningAudit as never,
    ).execute(7, 10, 'Reincidencia');

    expect(result.estado).toBe(EstadoTicket.REABIERTO);
    expect(deps.registerReopeningAudit.execute).toHaveBeenCalledWith({
      id_ticket: 7,
      id_usuario: 10,
      estado_anterior: 'Cerrado',
      estado_nuevo: 'Reabierto',
      motivo_reapertura: 'Reincidencia',
      ultimo_reporte_cierre: 'Reporte previo',
    });
  });

  it('lanza NotFoundException y no guarda ni audita si no existe', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findById.mockResolvedValue(null);

    await expect(
      new ReopenTicketUseCase(
        repository as never,
        deps.registerReopeningAudit as never,
      ).execute(999, 10, 'Reincidencia'),
    ).rejects.toThrow('Ticket con ID 999 no encontrado.');
    expect(repository.save).not.toHaveBeenCalled();
    expect(deps.registerReopeningAudit.execute).not.toHaveBeenCalled();
  });

  it('propaga la transición inválida desde el dominio', async () => {
    const repository = createTicketRepositoryMock();
    const deps = createTicketDepsMock();
    repository.findById.mockResolvedValue(buildTicket(EstadoTicket.PENDIENTE));

    await expect(
      new ReopenTicketUseCase(
        repository as never,
        deps.registerReopeningAudit as never,
      ).execute(7, 10, 'Reincidencia'),
    ).rejects.toThrow(
      "No se puede realizar la acción 'reabrir' en el estado 'Pendiente'.",
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});

describe('AssignSupportTicketUseCase', () => {
  it('asigna soporte y persiste el ticket', async () => {
    const repository = createTicketRepositoryMock();
    const ticket = buildTicket(EstadoTicket.PENDIENTE);
    repository.findById.mockResolvedValue(ticket);
    repository.save.mockImplementation(async (saved: Ticket) => saved);

    const result = await new AssignSupportTicketUseCase(
      repository as never,
    ).execute(7, 8);

    expect(result.id_soporte).toBe(8);
    expect(result.estado).toBe(EstadoTicket.ASIGNADO);
    expect(repository.save).toHaveBeenCalledWith(ticket);
  });

  it('lanza NotFoundException si el ticket no existe', async () => {
    const repository = createTicketRepositoryMock();
    repository.findById.mockResolvedValue(null);

    await expect(
      new AssignSupportTicketUseCase(repository as never).execute(999, 8),
    ).rejects.toThrow('Ticket con ID 999 no encontrado.');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('propaga la transición inválida desde el dominio', async () => {
    const repository = createTicketRepositoryMock();
    repository.findById.mockResolvedValue(buildTicket(EstadoTicket.CERRADO));

    await expect(
      new AssignSupportTicketUseCase(repository as never).execute(7, 8),
    ).rejects.toThrow(
      "No se puede realizar la acción 'asignarSoporte' en el estado 'Cerrado'.",
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
