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

describe('TicketsController - PATCH /ticket/:id/reopen', () => {
  let app: INestApplication;
  let mocks: TicketsUseCaseMocks;

  const validBody = {
    motivo_reapertura: 'El error de licencia volvió a aparecer',
  };

  beforeEach(async () => {
    mocks = createTicketsMocks();
    app = await createTicketsTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con id, usuario y motivo', async () => {
    const reopened = { id_tickets: 5, estado: 'Reabierto', ...validBody };
    mocks.reopenTicket.execute.mockResolvedValue(reopened);

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/reopen')
      .send(validBody)
      .expect(200);

    expect(mocks.reopenTicket.execute).toHaveBeenCalledWith(
      5,
      10,
      validBody.motivo_reapertura,
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Ticket reabierto correctamente',
      data: reopened,
    });
  });

  it('exige JwtAuthGuard y no define roles en este endpoint', async () => {
    expectTicketsGuards('reopen');
    mocks.reopenTicket.execute.mockResolvedValue({ id_tickets: 5 });

    await request(app.getHttpServer())
      .patch('/ticket/5/reopen')
      .send(validBody)
      .expect(200);

    expect(mocks.reopenTicket.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    const unauth = await createTicketsTestApp(mocks, {
      authenticated: false,
      userId: 10,
    });

    const response = await request(unauth.getHttpServer())
      .patch('/ticket/5/reopen')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.reopenTicket.execute).not.toHaveBeenCalled();
    await unauth.close();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/ticket/abc/reopen')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.reopenTicket.execute).not.toHaveBeenCalled();
  });

  it('rechaza motivo vacío con el mensaje personalizado del DTO', async () => {
    const response = await request(app.getHttpServer())
      .patch('/ticket/5/reopen')
      .send({ motivo_reapertura: '' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El motivo de reapertura es obligatorio.',
    );
    expect(mocks.reopenTicket.execute).not.toHaveBeenCalled();
  });

  it('caso borde: con implicit conversion un número se coerces a string antes del DTO', async () => {
    mocks.reopenTicket.execute.mockResolvedValue({ id_tickets: 5 });

    await request(app.getHttpServer())
      .patch('/ticket/5/reopen')
      .send({ motivo_reapertura: 123 })
      .expect(200);

    expect(mocks.reopenTicket.execute).toHaveBeenCalledWith(5, 10, '123');
  });

  it('rechaza campos extra con 400', async () => {
    const response = await request(app.getHttpServer())
      .patch('/ticket/5/reopen')
      .send({ ...validBody, extra: 'x' })
      .expect(400);

    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.reopenTicket.execute).not.toHaveBeenCalled();
  });

  it('convierte NotFoundException del caso de uso en 404', async () => {
    mocks.reopenTicket.execute.mockRejectedValue(
      new NotFoundException('Ticket con ID 999 no encontrado.'),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/999/reopen')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Ticket con ID 999 no encontrado.',
      data: null,
    });
  });

  it('convierte un Error plano de transición inválida en 500', async () => {
    mocks.reopenTicket.execute.mockRejectedValue(
      new Error("No se puede realizar la acción 'reabrir' en el estado 'Pendiente'."),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/reopen')
      .send(validBody)
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: "No se puede realizar la acción 'reabrir' en el estado 'Pendiente'.",
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.reopenTicket.execute.mockRejectedValue(
      new TestDomainException('No se pudo reabrir el ticket', 422),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/reopen')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No se pudo reabrir el ticket',
      data: null,
    });
  });
});
