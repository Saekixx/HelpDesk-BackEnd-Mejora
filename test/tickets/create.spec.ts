import type { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { RolUsuario } from '@/tickets/domain/entities/ticket.entity';
import {
  createTicketsMocks,
  createTicketsTestApp,
  expectTicketsGuards,
  TestDomainException,
  type TestAuthState,
  type TicketsUseCaseMocks,
  workerAuthState,
} from './helpers';

describe('TicketsController - POST /ticket', () => {
  let app: INestApplication;
  let mocks: TicketsUseCaseMocks;

  const validBody = {
    asunto: 'Impresora averiada',
    detalle: 'La impresora no enciende y muestra luz roja',
    equipoId: 3,
  };

  async function setup(state: TestAuthState = workerAuthState()) {
    mocks = createTicketsMocks();
    app = await createTicketsTestApp(mocks, state);
  }

  beforeEach(async () => {
    await setup();
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con el usuario autenticado', async () => {
    const created = { id_tickets: 1, pin: '123456', ...validBody };
    mocks.createTicket.execute.mockResolvedValue(created);

    const response = await request(app.getHttpServer())
      .post('/ticket')
      .send(validBody)
      .expect(201);

    expect(mocks.createTicket.execute).toHaveBeenCalledWith(10, validBody);
    expect(response.body).toEqual({
      status: 201,
      message: 'Ticket creado exitosamente',
      data: created,
    });
  });

  it('declara @Roles(CLIENTE_TRABAJADOR) pero no RoleGuard: no se enforcea en runtime', async () => {
    expectTicketsGuards('create', [RolUsuario.CLIENTE_TRABAJADOR]);
    await setup(workerAuthState({ role: RolUsuario.ADMINISTRADOR }));
    mocks.createTicket.execute.mockResolvedValue({ id_tickets: 1 });

    const response = await request(app.getHttpServer())
      .post('/ticket')
      .send(validBody)
      .expect(201);

    expect(response.body.status).toBe(201);
    expect(mocks.createTicket.execute).toHaveBeenCalledWith(10, validBody);
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(workerAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .post('/ticket')
      .send(validBody)
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Token inválido o expirado',
      data: null,
    });
    expect(mocks.createTicket.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido y campos extra con 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/ticket')
      .send({
        asunto: '',
        detalle: '',
        equipoId: 1.5,
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('asunto should not be empty');
    expect(response.body.message).toContain('detalle should not be empty');
    expect(response.body.message).toContain(
      'equipoId must be an integer number',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.createTicket.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.createTicket.execute.mockRejectedValue(
      new TestDomainException('El equipo no pertenece al trabajador', 409),
    );

    const response = await request(app.getHttpServer())
      .post('/ticket')
      .send(validBody)
      .expect(409);

    expect(response.body).toEqual({
      status: 409,
      message: 'El equipo no pertenece al trabajador',
      data: null,
    });
  });

  it('convierte BadRequestException de propiedad de equipo en 400', async () => {
    mocks.createTicket.execute.mockRejectedValue(
      new BadRequestException(
        'El equipo con ID 3 no pertenece al trabajador con ID 10.',
      ),
    );

    const response = await request(app.getHttpServer())
      .post('/ticket')
      .send(validBody)
      .expect(400);

    expect(response.body).toEqual({
      status: 400,
      message: 'El equipo con ID 3 no pertenece al trabajador con ID 10.',
      data: null,
    });
  });

  it('caso borde: esSoftware se reenvía tal cual cuando se envía explícitamente', async () => {
    mocks.createTicket.execute.mockResolvedValue({ id_tickets: 2 });
    const body = { ...validBody, esSoftware: true };

    await request(app.getHttpServer()).post('/ticket').send(body).expect(201);

    expect(mocks.createTicket.execute).toHaveBeenCalledWith(10, body);
  });

  it('caso borde: equipoId numérico enviado como string se convierte implícitamente', async () => {
    mocks.createTicket.execute.mockResolvedValue({ id_tickets: 3 });

    await request(app.getHttpServer())
      .post('/ticket')
      .send({ ...validBody, equipoId: '3' })
      .expect(201);

    expect(mocks.createTicket.execute).toHaveBeenCalledWith(10, {
      ...validBody,
      equipoId: 3,
    });
  });
});
