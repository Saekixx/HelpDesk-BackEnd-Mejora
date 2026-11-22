import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { ClienteController } from '@/clientes/infrastructure/controllers/cliente.controller';
import {
  adminAuthState,
  CLIENTES_READ_ROLES,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  TestDomainException,
  type ClientesUseCaseMocks,
} from './helpers';

describe('ClienteController - GET /clientes/options', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con la lista de opciones', async () => {
    await setup();
    const options = [
      { value: 1, label: 'Acme Corp' },
      { value: 2, label: 'Globex' },
    ];
    mocks.getClientesOptions.execute.mockResolvedValue(options);

    const response = await request(app.getHttpServer())
      .get('/clientes/options')
      .expect(200);

    expect(mocks.getClientesOptions.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Operación realizada con éxito',
      data: options,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase con los tres roles de lectura', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));
    expectClientesGuards(
      ClienteController,
      'getClientesOptions',
      CLIENTES_READ_ROLES,
    );
    mocks.getClientesOptions.execute.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/clientes/options').expect(200);

    expect(mocks.getClientesOptions.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/clientes/options')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getClientesOptions.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles fuera de la triple de lectura', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_TRABAJADOR }));

    const response = await request(app.getHttpServer())
      .get('/clientes/options')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getClientesOptions.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 500 con data null', async () => {
    await setup();
    mocks.getClientesOptions.execute.mockRejectedValue(
      new TestDomainException('Error al listar opciones', 500),
    );

    const response = await request(app.getHttpServer())
      .get('/clientes/options')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Error al listar opciones',
      data: null,
    });
  });

  it('caso borde: lista vacía de opciones se devuelve sin error', async () => {
    await setup();
    mocks.getClientesOptions.execute.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/clientes/options')
      .expect(200);

    expect(response.body.data).toEqual([]);
  });
});
