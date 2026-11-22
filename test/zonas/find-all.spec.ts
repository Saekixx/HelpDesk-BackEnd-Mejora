import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  authenticatedState,
  createZonaMocks,
  createZonaTestApp,
  expectZonaGuard,
  TestDomainException,
  type TestAuthState,
  type ZonaUseCaseMocks,
} from './helpers';

describe('ZonasController - GET /zona', () => {
  let app: INestApplication;
  let mocks: ZonaUseCaseMocks;

  async function setup(state: TestAuthState = authenticatedState()) {
    mocks = createZonaMocks();
    app = await createZonaTestApp(mocks, state);
  }

  beforeEach(async () => {
    await setup();
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con los filtros transformados', async () => {
    const result = {
      data: [{ id_zona: 1, nombre_zona: 'Zona Norte', is_active: true }],
      total: 1,
      page: 2,
      limit: 20,
      totalPages: 1,
    };
    mocks.getZonas.execute.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/zona')
      .query({ search: 'Norte', is_active: 'true', page: 2, limit: 20 })
      .expect(200);

    expect(mocks.getZonas.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'Norte',
        is_active: true,
        page: 2,
        limit: 20,
      }),
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Zonas encontradas correctamente',
      data: result,
    });
  });

  it('aplica page=1 y limit=10 por defecto', async () => {
    mocks.getZonas.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await request(app.getHttpServer()).get('/zona').expect(200);

    expect(mocks.getZonas.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('exige solo JwtAuthGuard a nivel de clase y permite cualquier rol', async () => {
    await setup(authenticatedState({ role: RolEnum.CLIENTE_EMPRESA }));
    expectZonaGuard('findAll');
    mocks.getZonas.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await request(app.getHttpServer()).get('/zona').expect(200);

    expect(mocks.getZonas.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(authenticatedState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/zona')
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Token inválido o expirado',
      data: null,
    });
    expect(mocks.getZonas.execute).not.toHaveBeenCalled();
  });

  it('rechaza filtros inválidos y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    const response = await request(app.getHttpServer())
      .get('/zona')
      .query({ page: 0, extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.getZonas.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 422 con data null', async () => {
    mocks.getZonas.execute.mockRejectedValue(
      new TestDomainException('Filtros inválidos', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/zona')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Filtros inválidos',
      data: null,
    });
  });

  it('caso borde: lista vacía se devuelve con data paginada sin error', async () => {
    const empty = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    mocks.getZonas.execute.mockResolvedValue(empty);

    const response = await request(app.getHttpServer())
      .get('/zona')
      .expect(200);

    expect(response.body.data).toEqual(empty);
  });

  it('caso borde: is_active=false en query se transforma en true por @Type(() => Boolean)', async () => {
    mocks.getZonas.execute.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    await request(app.getHttpServer())
      .get('/zona')
      .query({ is_active: 'false' })
      .expect(200);

    expect(mocks.getZonas.execute).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
  });
});
