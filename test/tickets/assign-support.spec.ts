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

describe('TicketsController - PATCH /ticket/:id/assign-support', () => {
  let app: INestApplication;
  let mocks: TicketsUseCaseMocks;

  beforeEach(async () => {
    mocks = createTicketsMocks();
    app = await createTicketsTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con el id de soporte del body', async () => {
    const assigned = { id_tickets: 5, id_soporte: 8, estado: 'Asignado' };
    mocks.assignSupport.execute.mockResolvedValue(assigned);

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/assign-support')
      .set('Content-Type', 'application/json')
      .send('8')
      .expect(200);

    expect(mocks.assignSupport.execute).toHaveBeenCalledWith(5, 8);
    expect(response.body).toEqual({
      status: 200,
      message: 'Soporte asignado correctamente',
      data: assigned,
    });
  });

  it('exige JwtAuthGuard y no define roles en este endpoint', async () => {
    expectTicketsGuards('assignSupport');
    mocks.assignSupport.execute.mockResolvedValue({ id_tickets: 5 });

    await request(app.getHttpServer())
      .patch('/ticket/5/assign-support')
      .set('Content-Type', 'application/json')
      .send('8')
      .expect(200);

    expect(mocks.assignSupport.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    const unauth = await createTicketsTestApp(mocks, {
      authenticated: false,
      userId: 10,
    });

    const response = await request(unauth.getHttpServer())
      .patch('/ticket/5/assign-support')
      .set('Content-Type', 'application/json')
      .send('8')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.assignSupport.execute).not.toHaveBeenCalled();
    await unauth.close();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/ticket/abc/assign-support')
      .set('Content-Type', 'application/json')
      .send('8')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.assignSupport.execute).not.toHaveBeenCalled();
  });

  it('convierte NotFoundException del caso de uso en 404', async () => {
    mocks.assignSupport.execute.mockRejectedValue(
      new NotFoundException('Ticket con ID 999 no encontrado.'),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/999/assign-support')
      .set('Content-Type', 'application/json')
      .send('8')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Ticket con ID 999 no encontrado.',
      data: null,
    });
  });

  it('convierte un Error plano de transición inválida en 500', async () => {
    mocks.assignSupport.execute.mockRejectedValue(
      new Error(
        "No se puede realizar la acción 'asignarSoporte' en el estado 'Pendiente'.",
      ),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/assign-support')
      .set('Content-Type', 'application/json')
      .send('8')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message:
        "No se puede realizar la acción 'asignarSoporte' en el estado 'Pendiente'.",
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.assignSupport.execute.mockRejectedValue(
      new TestDomainException('No se pudo asignar el soporte', 422),
    );

    const response = await request(app.getHttpServer())
      .patch('/ticket/5/assign-support')
      .set('Content-Type', 'application/json')
      .send('8')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No se pudo asignar el soporte',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y el body primitivo 0 se reenvía', async () => {
    mocks.assignSupport.execute.mockResolvedValue({ id_tickets: 0 });

    await request(app.getHttpServer())
      .patch('/ticket/0/assign-support')
      .set('Content-Type', 'application/json')
      .send('0')
      .expect(200);

    expect(mocks.assignSupport.execute).toHaveBeenCalledWith(0, 0);
  });
});
