import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { SucursalController } from '@/clientes/infrastructure/controllers/sucursal.controller';
import {
  adminAuthState,
  CLIENTES_READ_ROLES,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  TestDomainException,
  type ClientesUseCaseMocks,
} from './helpers';

describe('SucursalController - GET /sucursales', () => {
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
    const rows = [{ id_sucursal: 1, nombre_sucursal: 'Sucursal Centro' }];
    const meta = { page: 2, limit: 20, total: 15, totalPages: 1 };
    mocks.getSucursales.execute.mockResolvedValue({ data: rows, meta });

    const response = await request(app.getHttpServer())
      .get('/sucursales')
      .query({
        id_cliente: 1,
        search: 'Centro',
        is_active: 'false',
        page: 2,
        limit: 20,
      })
      .expect(200);

    expect(mocks.getSucursales.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        id_cliente: 1,
        search: 'Centro',
        is_active: false,
        page: 2,
        limit: 20,
      }),
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Sucursales obtenidas exitosamente',
      data: { data: rows, meta },
    });
  });

  it('aplica page=1 y limit=10 por defecto', async () => {
    await setup();
    mocks.getSucursales.execute.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer()).get('/sucursales').expect(200);

    expect(mocks.getSucursales.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase con los tres roles de lectura', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));
    expectClientesGuards(SucursalController, 'findAll', CLIENTES_READ_ROLES);
    mocks.getSucursales.execute.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer()).get('/sucursales').expect(200);

    expect(mocks.getSucursales.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/sucursales')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getSucursales.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_TRABAJADOR }));

    const response = await request(app.getHttpServer())
      .get('/sucursales')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getSucursales.execute).not.toHaveBeenCalled();
  });

  it('rechaza filtros inválidos y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/sucursales')
      .query({ id_cliente: 'abc', page: 0, extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.getSucursales.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 422 con data null', async () => {
    await setup();
    mocks.getSucursales.execute.mockRejectedValue(
      new TestDomainException('Filtros inválidos', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/sucursales')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Filtros inválidos',
      data: null,
    });
  });

  it('caso borde: is_active=true se transforma correctamente', async () => {
    await setup();
    mocks.getSucursales.execute.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer())
      .get('/sucursales')
      .query({ is_active: 'true' })
      .expect(200);

    expect(mocks.getSucursales.execute).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
  });
});
