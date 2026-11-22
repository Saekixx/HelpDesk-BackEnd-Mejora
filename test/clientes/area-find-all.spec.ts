import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { AreaController } from '@/clientes/infrastructure/controllers/area.controller';
import {
  adminAuthState,
  CLIENTES_READ_ROLES,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  TestDomainException,
  type ClientesUseCaseMocks,
} from './helpers';

describe('AreaController - GET /areas', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createClientesMocks();
    app = await createClientesTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con los filtros transformados', async () => {
    await setup();
    const rows = [{ id_area: 1, nombre_area: 'Área de Sistemas' }];
    const meta = { page: 2, limit: 20, total: 12, totalPages: 1 };
    mocks.getAreas.execute.mockResolvedValue({ data: rows, meta });

    const response = await request(app.getHttpServer())
      .get('/areas')
      .query({
        id_cliente: 1,
        id_sucursal: 2,
        search: 'Sistemas',
        is_active: 'false',
        page: 2,
        limit: 20,
      })
      .expect(200);

    expect(mocks.getAreas.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        id_cliente: 1,
        id_sucursal: 2,
        search: 'Sistemas',
        is_active: false,
        page: 2,
        limit: 20,
      }),
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Áreas obtenidas exitosamente',
      data: { data: rows, meta },
    });
  });

  it('aplica page=1 y limit=10 por defecto', async () => {
    await setup();
    mocks.getAreas.execute.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer()).get('/areas').expect(200);

    expect(mocks.getAreas.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase con los tres roles de lectura', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));
    expectClientesGuards(AreaController, 'findAll', CLIENTES_READ_ROLES);
    mocks.getAreas.execute.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer()).get('/areas').expect(200);

    expect(mocks.getAreas.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/areas')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getAreas.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_EMPRESA }));

    const response = await request(app.getHttpServer())
      .get('/areas')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getAreas.execute).not.toHaveBeenCalled();
  });

  it('rechaza filtros inválidos y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/areas')
      .query({ id_sucursal: 'abc', page: 0, extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.getAreas.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 422 con data null', async () => {
    await setup();
    mocks.getAreas.execute.mockRejectedValue(
      new TestDomainException('Filtros inválidos', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/areas')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Filtros inválidos',
      data: null,
    });
  });

  it('caso borde: is_active=true se transforma correctamente', async () => {
    await setup();
    mocks.getAreas.execute.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer())
      .get('/areas')
      .query({ is_active: 'true' })
      .expect(200);

    expect(mocks.getAreas.execute).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
  });
});
