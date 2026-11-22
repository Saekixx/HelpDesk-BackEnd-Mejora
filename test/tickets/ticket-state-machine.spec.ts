import { describe, expect, it } from 'vitest';

import {
  EstadoTicket,
  RolUsuario,
  Ticket,
} from '@/tickets/domain/entities/ticket.entity';
import { InvalidStateTransitionException } from '@/tickets/domain/exceptions/invalid-state-transition.exception';

function buildTicket(estado: EstadoTicket, id_soporte?: number | null): Ticket {
  return new Ticket({
    id_tickets: 1,
    pin: '123456',
    asunto: 'Asunto',
    detalle: 'Detalle',
    estado,
    id_equipo: 3,
    id_trabajador: 10,
    id_soporte,
  });
}

describe('Ticket - máquina de estados', () => {
  it('Pendiente permite asignar soporte (pasa a Asignado) y cerrar', () => {
    const asignado = buildTicket(EstadoTicket.PENDIENTE);
    asignado.asignarSoporte(7);
    expect(asignado.estado).toBe(EstadoTicket.ASIGNADO);
    expect(asignado.id_soporte).toBe(7);

    const cerrado = buildTicket(EstadoTicket.PENDIENTE);
    cerrado.cerrar('Resuelto sin asignación');
    expect(cerrado.estado).toBe(EstadoTicket.CERRADO);
    expect(cerrado.reporte_cierre).toBe('Resuelto sin asignación');
  });

  it('Pendiente rechaza reabrir, derivar insitu y espera de repuesto', () => {
    const ticket = buildTicket(EstadoTicket.PENDIENTE);
    expect(() => ticket.reabrir()).toThrow(InvalidStateTransitionException);
    expect(() => ticket.derivarInsitu()).toThrow(
      InvalidStateTransitionException,
    );
    expect(() => ticket.enEsperaRepuesto()).toThrow(
      InvalidStateTransitionException,
    );
  });

  it('Asignado permite reasignar soporte sin cambiar de estado, iniciar chat y cerrar', () => {
    const ticket = buildTicket(EstadoTicket.ASIGNADO, 7);
    ticket.asignarSoporte(8);
    expect(ticket.estado).toBe(EstadoTicket.ASIGNADO);
    expect(ticket.id_soporte).toBe(8);

    ticket.iniciarChat();
    expect(ticket.estado).toBe(EstadoTicket.EN_PROGRESO);

    const otro = buildTicket(EstadoTicket.ASIGNADO);
    otro.cerrar();
    expect(otro.estado).toBe(EstadoTicket.CERRADO);
  });

  it('En Progreso permite cerrar, derivar a insitu y reasignar soporte sin cambiar de estado', () => {
    const derivado = buildTicket(EstadoTicket.EN_PROGRESO, 7);
    derivado.derivarInsitu();
    expect(derivado.estado).toBe('Derivado Insitu');
    expect(derivado.id_soporte).toBe(7);

    const reasignado = buildTicket(EstadoTicket.EN_PROGRESO);
    reasignado.asignarSoporte(9);
    expect(reasignado.estado).toBe(EstadoTicket.EN_PROGRESO);
    expect(reasignado.id_soporte).toBe(9);

    const cerrado = buildTicket(EstadoTicket.EN_PROGRESO);
    cerrado.iniciarChat();
    cerrado.cerrar('OK');
    expect(cerrado.estado).toBe(EstadoTicket.CERRADO);
  });

  it('Reabierto permite derivar insitu, asignar soporte, iniciar chat y cerrar', () => {
    const derivado = buildTicket(EstadoTicket.REABIERTO, 3);
    derivado.derivarInsitu();
    expect(derivado.estado).toBe('Derivado Insitu');
    expect(derivado.id_soporte).toBe(3);

    const asignado = buildTicket(EstadoTicket.REABIERTO);
    asignado.asignarSoporte(4);
    expect(asignado.estado).toBe(EstadoTicket.ASIGNADO);

    const enProgreso = buildTicket(EstadoTicket.REABIERTO);
    enProgreso.iniciarChat();
    expect(enProgreso.estado).toBe(EstadoTicket.EN_PROGRESO);

    const cerrado = buildTicket(EstadoTicket.REABIERTO);
    cerrado.cerrar('Solucionado');
    expect(cerrado.estado).toBe(EstadoTicket.CERRADO);
  });

  it('Cerrado solo permite reabrir', () => {
    const ticket = buildTicket(EstadoTicket.CERRADO);
    ticket.reabrir();
    expect(ticket.estado).toBe(EstadoTicket.REABIERTO);

    const otro = buildTicket(EstadoTicket.CERRADO);
    expect(() => otro.cerrar()).toThrow(InvalidStateTransitionException);
    expect(() => otro.asignarSoporte(1)).toThrow(
      InvalidStateTransitionException,
    );
    expect(() => otro.derivarInsitu()).toThrow(
      InvalidStateTransitionException,
    );
  });

  it('Derivado Insitu permite asignar soporte, cerrar y pasar a espera de repuesto', () => {
    const ticket = buildTicket(EstadoTicket.DERIVADO_INSITU);
    ticket.asignarSoporte(11);
    expect(ticket.estado).toBe('Derivado Insitu');
    expect(ticket.id_soporte).toBe(11);

    ticket.enEsperaRepuesto();
    expect(ticket.estado).toBe(EstadoTicket.EN_ESPERA_REPUESTO);

    const cerrado = buildTicket(EstadoTicket.DERIVADO_INSITU);
    cerrado.cerrar();
    expect(cerrado.estado).toBe(EstadoTicket.CERRADO);

    expect(() => ticket.reabrir()).toThrow(InvalidStateTransitionException);
    expect(() => ticket.derivarInsitu()).toThrow(
      InvalidStateTransitionException,
    );
  });

  it('En Espera Repuesto permite cerrar y repetir enEsperaRepuesto sin cambio', () => {
    const ticket = buildTicket(EstadoTicket.EN_ESPERA_REPUESTO);
    ticket.enEsperaRepuesto();
    expect(ticket.estado).toBe(EstadoTicket.EN_ESPERA_REPUESTO);

    ticket.cerrar();
    expect(ticket.estado).toBe(EstadoTicket.CERRADO);

    const otro = buildTicket(EstadoTicket.EN_ESPERA_REPUESTO);
    expect(() => otro.reabrir()).toThrow(InvalidStateTransitionException);
    expect(() => otro.asignarSoporte(1)).toThrow(
      InvalidStateTransitionException,
    );
  });

  it('InvalidStateTransitionException construye el mensaje exacto', () => {
    const ticket = buildTicket(EstadoTicket.CERRADO);
    expect(() => ticket.reabrir()).not.toThrow();

    const otro = buildTicket(EstadoTicket.PENDIENTE);
    try {
      otro.reabrir();
      expect.unreachable('Debe lanzar la excepción');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidStateTransitionException);
      expect((error as Error).message).toBe(
        "No se puede realizar la acción 'reabrir' en el estado 'Pendiente'.",
      );
      expect((error as Error).name).toBe('InvalidStateTransitionException');
    }
  });

  it('puedeSerCerradoPor aplica admin, soporte asignado y trabajador creador', () => {
    const ticket = buildTicket(EstadoTicket.EN_PROGRESO, 7);

    expect(ticket.puedeSerCerradoPor(99, RolUsuario.ADMINISTRADOR)).toBe(true);
    expect(ticket.puedeSerCerradoPor(7, RolUsuario.SOPORTE_TECNICO)).toBe(true);
    expect(ticket.puedeSerCerradoPor(7, RolUsuario.SOPORTE_INSITU)).toBe(true);
    expect(ticket.puedeSerCerradoPor(8, RolUsuario.SOPORTE_TECNICO)).toBe(false);
    expect(ticket.puedeSerCerradoPor(10, RolUsuario.CLIENTE_TRABAJADOR)).toBe(
      true,
    );
    expect(ticket.puedeSerCerradoPor(11, RolUsuario.CLIENTE_TRABAJADOR)).toBe(
      false,
    );
    expect(ticket.puedeSerCerradoPor(10, 'ROL_DESCONOCIDO')).toBe(false);
  });

  it('puedeSerReabiertoPor solo admite admin y clientes creadores', () => {
    const ticket = buildTicket(EstadoTicket.CERRADO, 7);

    expect(ticket.puedeSerReabiertoPor(99, RolUsuario.ADMINISTRADOR)).toBe(true);
    expect(ticket.puedeSerReabiertoPor(10, RolUsuario.CLIENTE_EMPRESA)).toBe(
      true,
    );
    expect(ticket.puedeSerReabiertoPor(11, RolUsuario.CLIENTE_SUCURSAL)).toBe(
      false,
    );
    expect(ticket.puedeSerReabiertoPor(7, RolUsuario.SOPORTE_TECNICO)).toBe(
      false,
    );
  });

  it('canAccess permite al creador y al soporte asignado', () => {
    const ticket = buildTicket(EstadoTicket.EN_PROGRESO, 7);

    expect(ticket.canAccess(10)).toBe(true);
    expect(ticket.canAccess(7)).toBe(true);
    expect(ticket.canAccess(99)).toBe(false);
  });
});
