import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { ClienteController } from '@/clientes/infrastructure/controllers/cliente.controller';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import {
  adminAuthState,
  CLIENTES_READ_ROLES,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  type ClientesUseCaseMocks,
} from './helpers';

describe('ClienteController - GET /clientes/:id', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con el id parseado', async () => {
    await setup();
    const detail = { id_cliente: 7, nombre_principal: 'Acme Corp' };
    mocks.getClienteById.execute.mockResolvedValue(detail);

    const response = await request(app.getHttpServer())
      .get('/clientes/7')
      .expect(200);

    expect(mocks.getClienteById.execute).toHaveBeenCalledWith(7);
    expect(response.body).toEqual({
      status: 200,
      message: 'Cliente obtenido exitosamente',
      data: detail,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase con los tres roles de lectura', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));
    expectClientesGuards(ClienteController, 'findOne', CLIENTES_READ_ROLES);
    mocks.getClienteById.execute.mockResolvedValue({ id_cliente: 7 });

    await request(app.getHttpServer()).get('/clientes/7').expect(200);

    expect(mocks.getClienteById.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/clientes/7')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getClienteById.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_EMPRESA }));

    const response = await request(app.getHttpServer())
      .get('/clientes/7')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getClienteById.execute).not.toHaveBeenCalled();
  });

  it('rechaza un id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/clientes/abc')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.getClienteById.execute).not.toHaveBeenCalled();
  });

  it('convierte ClienteNotFoundException (DomainException) en 404 con data null', async () => {
    await setup();
    mocks.getClienteById.execute.mockRejectedValue(
      new ClienteNotFoundException(),
    );

    const response = await request(app.getHttpServer())
      .get('/clientes/999')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Cliente no encontrado',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    await setup();
    mocks.getClienteById.execute.mockResolvedValue({ id_cliente: 0 });

    await request(app.getHttpServer()).get('/clientes/0').expect(200);

    expect(mocks.getClienteById.execute).toHaveBeenCalledWith(0);
  });
});
