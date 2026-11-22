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

describe('ClienteController - GET /clientes', () => {
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

  it('devuelve 200, datos paginados y la envoltura { status, message, data }', async () => {
    await setup();
    const rows = [{ id_cliente: 1, nombre_principal: 'Acme Corp' }];
    const meta = { page: 2, limit: 20, total: 21, totalPages: 2 };
    mocks.getClientes.execute.mockResolvedValue({ data: rows, meta });

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .query({
        search: '  Acme  ',
        tipo_cliente: 'JURIDICA',
        is_active: 'false',
        page: 2,
        limit: 20,
      })
      .expect(200);

    expect(mocks.getClientes.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'Acme',
        tipo_cliente: 'JURIDICA',
        is_active: false,
        page: 2,
        limit: 20,
      }),
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Clientes obtenidos exitosamente',
      data: { data: rows, meta },
    });
  });

  it('aplica page=1 y limit=10 por defecto', async () => {
    await setup();
    mocks.getClientes.execute.mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    await request(app.getHttpServer()).get('/clientes').expect(200);

    expect(mocks.getClientes.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase con los tres roles de lectura', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));
    expectClientesGuards(ClienteController, 'findAll', CLIENTES_READ_ROLES);
    mocks.getClientes.execute.mockResolvedValue({ data: [], meta: {} });

    await request(app.getHttpServer()).get('/clientes').expect(200);

    expect(mocks.getClientes.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Token inválido o expirado',
      data: null,
    });
    expect(mocks.getClientes.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para un rol de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_EMPRESA }));

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getClientes.execute).not.toHaveBeenCalled();
  });

  it('rechaza filtros inválidos y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .query({ tipo_cliente: 'OTRO', page: 0, extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El tipo de cliente debe ser JURIDICA o NATURAL',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.getClientes.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 422 con data null', async () => {
    await setup();
    mocks.getClientes.execute.mockRejectedValue(
      new TestDomainException('Filtros inválidos', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Filtros inválidos',
      data: null,
    });
  });

  it('caso borde: lista vacía se devuelve con meta sin error', async () => {
    await setup();
    const empty = {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    mocks.getClientes.execute.mockResolvedValue(empty);

    const response = await request(app.getHttpServer())
      .get('/clientes')
      .expect(200);

    expect(response.body.data).toEqual(empty);
  });
});
