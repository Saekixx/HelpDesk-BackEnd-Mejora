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

describe('TicketsController - GET /ticket/:id', () => {
  let app: INestApplication;
  let mocks: TicketsUseCaseMocks;

  beforeEach(async () => {
    mocks = createTicketsMocks();
    app = await createTicketsTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con el detalle del ticket', async () => {
    const detalle = {
      id_tickets: 7,
      pin: '123456',
      asunto: 'Impresora averiada',
      estado: 'En Progreso',
    };
    mocks.getTicketDetalle.execute.mockResolvedValue(detalle);

    const response = await request(app.getHttpServer())
      .get('/ticket/7')
      .expect(200);

    expect(mocks.getTicketDetalle.execute).toHaveBeenCalledWith(7);
    expect(response.body).toEqual({
      status: 200,
      message: 'Ticket obtenido exitosamente',
      data: detalle,
    });
  });

  it('exige JwtAuthGuard y no define roles en este endpoint', async () => {
    expectTicketsGuards('findById');
    mocks.getTicketDetalle.execute.mockResolvedValue({ id_tickets: 7 });

    const response = await request(app.getHttpServer())
      .get('/ticket/7')
      .expect(200);

    expect(mocks.getTicketDetalle.execute).toHaveBeenCalledOnce();
    expect(response.body.status).toBe(200);
  });

  it('devuelve 401 sin autenticación', async () => {
    const unauth = await createTicketsTestApp(mocks, {
      authenticated: false,
      userId: 10,
    });

    const response = await request(unauth.getHttpServer())
      .get('/ticket/7')
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Token inválido o expirado',
      data: null,
    });
    expect(mocks.getTicketDetalle.execute).not.toHaveBeenCalled();
    await unauth.close();
  });

  it('rechaza un id no numérico con 400 (ParseIntPipe)', async () => {
    const response = await request(app.getHttpServer())
      .get('/ticket/abc')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.getTicketDetalle.execute).not.toHaveBeenCalled();
  });

  it('convierte NotFoundException de "Ticket no encontrado" en 404', async () => {
    mocks.getTicketDetalle.execute.mockRejectedValue(
      new NotFoundException('Ticket no encontrado'),
    );

    const response = await request(app.getHttpServer())
      .get('/ticket/999')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Ticket no encontrado',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.getTicketDetalle.execute.mockRejectedValue(
      new TestDomainException('Detalle no disponible', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/ticket/5')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Detalle no disponible',
      data: null,
    });
  });

  it('convierte un Error plano en 500 con data null', async () => {
    mocks.getTicketDetalle.execute.mockRejectedValue(
      new Error('Fallo inesperado'),
    );

    const response = await request(app.getHttpServer())
      .get('/ticket/5')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Fallo inesperado',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    mocks.getTicketDetalle.execute.mockResolvedValue({ id_tickets: 0 });

    await request(app.getHttpServer()).get('/ticket/0').expect(200);

    expect(mocks.getTicketDetalle.execute).toHaveBeenCalledWith(0);
  });

  it('caso borde: un mock que devuelve null responde 200 con data null', async () => {
    mocks.getTicketDetalle.execute.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get('/ticket/999')
      .expect(200);

    expect(response.body).toEqual({
      status: 200,
      message: 'Ticket obtenido exitosamente',
      data: null,
    });
  });
});
