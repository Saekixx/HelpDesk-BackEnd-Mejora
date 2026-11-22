import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createTicketsMocks,
  createTicketsTestApp,
  expectTicketsGuards,
  TestDomainException,
  type TestAuthState,
  type TicketsUseCaseMocks,
  workerAuthState,
} from './helpers';

describe('TicketsController - GET /ticket', () => {
  let app: INestApplication;
  let mocks: TicketsUseCaseMocks;

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

  it('devuelve 200 con la envoltura { status, message, data } y la data paginada anidada', async () => {
    const result = {
      data: [{ id_tickets: 1, asunto: 'Impresora averiada' }],
      total: 12,
      page: 2,
      limit: 5,
      totalPages: 3,
    };
    mocks.getTickets.execute.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/ticket')
      .query({ page: 2, limit: 5 })
      .expect(200);

    expect(mocks.getTickets.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Tickets obtenidos exitosamente',
      data: {
        data: result.data,
        meta: { total: 12, page: 2, limit: 5, totalPages: 3 },
      },
    });
  });

  it('transforma filtros de query: trim, enum, ids numéricos y paginación', async () => {
    mocks.getTickets.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
      totalPages: 0,
    });

    await request(app.getHttpServer())
      .get('/ticket')
      .query({
        search: '  impresora  ',
        estado: 'Pendiente',
        id_cliente: '3',
        id_sucursal: '4',
        id_area: '5',
        id_trabajador: '10',
        id_soporte: '7',
        page: '2',
        limit: '5',
      })
      .expect(200);

    expect(mocks.getTickets.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'impresora',
        estado: 'Pendiente',
        id_cliente: 3,
        id_sucursal: 4,
        id_area: 5,
        id_trabajador: 10,
        id_soporte: 7,
        page: 2,
        limit: 5,
      }),
    );
  });

  it('aplica page=1 y limit=10 por defecto', async () => {
    mocks.getTickets.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await request(app.getHttpServer()).get('/ticket').expect(200);

    expect(mocks.getTickets.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('exige JwtAuthGuard y no define roles en este endpoint', async () => {
    expectTicketsGuards('findAll');
    await setup(workerAuthState({ authenticated: false }));
    mocks.getTickets.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const response = await request(app.getHttpServer())
      .get('/ticket')
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Token inválido o expirado',
      data: null,
    });
    expect(mocks.getTickets.execute).not.toHaveBeenCalled();
  });

  it('rechaza filtros inválidos y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    const response = await request(app.getHttpServer())
      .get('/ticket')
      .query({ page: 0, limit: 0, estado: 'ESTADO_INEXISTENTE', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.getTickets.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.getTickets.execute.mockRejectedValue(
      new TestDomainException('No se pudieron listar los tickets', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/ticket')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No se pudieron listar los tickets',
      data: null,
    });
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    mocks.getTickets.execute.mockRejectedValue(
      new NotFoundException('Listado no disponible'),
    );

    const response = await request(app.getHttpServer())
      .get('/ticket')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Listado no disponible',
      data: null,
    });
  });

  it('caso borde: search vacío y estado "--" se transforman en undefined', async () => {
    mocks.getTickets.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await request(app.getHttpServer())
      .get('/ticket')
      .query({ search: '   ', estado: '--' })
      .expect(200);

    const filters = mocks.getTickets.execute.mock.calls[0]?.[0];
    expect(filters.search).toBeUndefined();
    expect(filters.estado).toBeUndefined();
  });

  it('caso borde: lista vacía se devuelve con meta sin error', async () => {
    mocks.getTickets.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const response = await request(app.getHttpServer())
      .get('/ticket')
      .expect(200);

    expect(response.body.data.data).toEqual([]);
    expect(response.body.data.meta.total).toBe(0);
  });
});
