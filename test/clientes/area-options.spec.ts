import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { AreaController } from '@/clientes/infrastructure/controllers/area.controller';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';
import {
  adminAuthState,
  CLIENTES_READ_ROLES,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  type ClientesUseCaseMocks,
} from './helpers';

describe('AreaController - GET /areas/:id/options', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con el id de la sucursal', async () => {
    await setup();
    const options = [
      { value: 8, label: 'Área de Sistemas' },
      { value: 9, label: 'Área de Ventas' },
    ];
    mocks.getAreasOptions.execute.mockResolvedValue(options);

    const response = await request(app.getHttpServer())
      .get('/areas/1/options')
      .expect(200);

    expect(mocks.getAreasOptions.execute).toHaveBeenCalledWith(1);
    expect(response.body).toEqual({
      status: 200,
      message: 'Operación realizada con éxito',
      data: options,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase con los tres roles de lectura', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));
    expectClientesGuards(AreaController, 'getAreasOptions', CLIENTES_READ_ROLES);
    mocks.getAreasOptions.execute.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/areas/1/options').expect(200);

    expect(mocks.getAreasOptions.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/areas/1/options')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getAreasOptions.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_SUCURSAL }));

    const response = await request(app.getHttpServer())
      .get('/areas/1/options')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getAreasOptions.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/areas/abc/options')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.getAreasOptions.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 404 con data null', async () => {
    await setup();
    mocks.getAreasOptions.execute.mockRejectedValue(
      new SucursalNotFoundException(),
    );

    const response = await request(app.getHttpServer())
      .get('/areas/999/options')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Sucursal no encontrada',
      data: null,
    });
  });

  it('caso borde: lista vacía de opciones se devuelve sin error', async () => {
    await setup();
    mocks.getAreasOptions.execute.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/areas/1/options')
      .expect(200);

    expect(response.body.data).toEqual([]);
  });
});
