import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createTicketsMocks,
  createTicketsTestApp,
  expectTicketsGuards,
  TestDomainException,
  type TicketsUseCaseMocks,
} from './helpers';

describe('TicketsController - PATCH /ticket/:id/close', () => {
  let app: INestApplication;
  let mocks: TicketsUseCaseMocks;

  const validBody = { reporte_cierre: 'Se reinstaló el controlador de red' };

  beforeEach(async () => {
    mocks = createTicketsMocks();
    app = await createTicketsTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con id, usuario y reporte', async () => {
    const closed = { id_tickets: 5, estado: 'Cerrado', ...validBody };
    mocks.closeTicket.execute.mockResolvedValue(closed);

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/close')
      .send(validBody)
      .expect(200);

    expect(mocks.closeTicket.execute).toHaveBeenCalledWith(
      5,
      10,
      validBody.reporte_cierre,
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Ticket cerrado correctamente',
      data: closed,
    });
  });

  it('exige JwtAuthGuard y no define roles en este endpoint', async () => {
    expectTicketsGuards('close');
    mocks.closeTicket.execute.mockResolvedValue({ id_tickets: 5 });

    await request(app.getHttpServer())
      .patch('/ticket/5/close')
      .send(validBody)
      .expect(200);

    expect(mocks.closeTicket.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    const unauth = await createTicketsTestApp(mocks, {
      authenticated: false,
      userId: 10,
    });

    const response = await request(unauth.getHttpServer())
      .patch('/ticket/5/close')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.closeTicket.execute).not.toHaveBeenCalled();
    await unauth.close();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/ticket/abc/close')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.closeTicket.execute).not.toHaveBeenCalled();
  });

  it('rechaza reporte vacío, no string y campos extra con 400', async () => {
    const response = await request(app.getHttpServer())
      .patch('/ticket/5/close')
      .send({ reporte_cierre: '', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'reporte_cierre should not be empty',
    );
    expect(response.body.message).toContain('property extra should not exist');

    expect(mocks.closeTicket.execute).not.toHaveBeenCalled();
  });

  it('caso borde: con implicit conversion un número se coerces a string antes del DTO', async () => {
    mocks.closeTicket.execute.mockResolvedValue({ id_tickets: 5 });

    await request(app.getHttpServer())
      .patch('/ticket/5/close')
      .send({ reporte_cierre: 123 })
      .expect(200);

    expect(mocks.closeTicket.execute).toHaveBeenCalledWith(5, 10, '123');
  });

  it('convierte NotFoundException del caso de uso en 404', async () => {
    mocks.closeTicket.execute.mockRejectedValue(
      new NotFoundException('Ticket con ID 999 no encontrado.'),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/999/close')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Ticket con ID 999 no encontrado.',
      data: null,
    });
  });

  it('convierte InvalidStateTransitionException en 500 (extiende Error, no DomainException)', async () => {
    mocks.closeTicket.execute.mockRejectedValue(
      new Error(
        "No se puede realizar la acción 'cerrar' en el estado 'Cerrado'.",
      ),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/close')
      .send(validBody)
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: "No se puede realizar la acción 'cerrar' en el estado 'Cerrado'.",
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.closeTicket.execute.mockRejectedValue(
      new TestDomainException('No se pudo cerrar el ticket', 422),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/close')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No se pudo cerrar el ticket',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0', async () => {
    mocks.closeTicket.execute.mockResolvedValue({ id_tickets: 0 });

    await request(app.getHttpServer())
      .patch('/ticket/0/close')
      .send(validBody)
      .expect(200);

    expect(mocks.closeTicket.execute).toHaveBeenCalledWith(
      0,
      10,
      validBody.reporte_cierre,
    );
  });
});
