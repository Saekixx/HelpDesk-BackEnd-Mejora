import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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
  type ClientesUseCaseMocks,
} from './helpers';

describe('SucursalController - GET /sucursales/estadisticas', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con GetSucursalStatsUseCase mockeado', async () => {
    await setup();
    const stats = { total: 8, activas: 6, inactivas: 2 };
    mocks.getSucursalStats.execute.mockResolvedValue(stats);

    const response = await request(app.getHttpServer())
      .get('/sucursales/estadisticas')
      .expect(200);

    expect(mocks.getSucursalStats.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Estadísticas de sucursales obtenidas exitosamente',
      data: stats,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase con los tres roles de lectura', async () => {
    await setup();
    expectClientesGuards(
      SucursalController,
      'getEstadisticas',
      CLIENTES_READ_ROLES,
    );
    mocks.getSucursalStats.execute.mockResolvedValue({ total: 0 });

    await request(app.getHttpServer())
      .get('/sucursales/estadisticas')
      .expect(200);

    expect(mocks.getSucursalStats.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/sucursales/estadisticas')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getSucursalStats.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_SUCURSAL }));

    const response = await request(app.getHttpServer())
      .get('/sucursales/estadisticas')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getSucursalStats.execute).not.toHaveBeenCalled();
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    await setup();
    mocks.getSucursalStats.execute.mockRejectedValue(
      new NotFoundException('Estadísticas no disponibles'),
    );

    const response = await request(app.getHttpServer())
      .get('/sucursales/estadisticas')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Estadísticas no disponibles',
      data: null,
    });
  });

  it('caso borde: contadores en cero se devuelven sin alterar', async () => {
    await setup();
    const stats = { total: 0, activas: 0, inactivas: 0 };
    mocks.getSucursalStats.execute.mockResolvedValue(stats);

    const response = await request(app.getHttpServer())
      .get('/sucursales/estadisticas')
      .expect(200);

    expect(response.body.data).toEqual(stats);
  });
});
