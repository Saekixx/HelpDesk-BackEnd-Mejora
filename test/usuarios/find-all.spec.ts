import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  adminAuthState,
  createUsuariosMocks,
  createUsuariosTestApp,
  expectUserGuards,
  TestDomainException,
  type UsuariosUseCaseMocks,
} from './helpers';

describe('UsersController - GET /usuario', () => {
  let app: INestApplication;
  let mocks: UsuariosUseCaseMocks;

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createUsuariosMocks();
    app = await createUsuariosTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 200, datos paginados y la envoltura { status, message, data }', async () => {
    await setup();
    const users = [{ id_usuario: 1, nombre: 'Jack' }];
    mocks.getUsers.execute.mockResolvedValue({
      data: users,
      page: 2,
      limit: 20,
      total: 21,
      totalPages: 2,
    });

    const response = await request(app.getHttpServer())
      .get('/usuario')
      .query({
        search: '  Jack  ',
        id_rol: 1,
        is_active: 'false',
        page: 2,
        limit: 20,
      })
      .expect(200);

    expect(mocks.getUsers.execute).toHaveBeenCalledWith({
      search: 'Jack',
      id_rol: 1,
      is_active: false,
      page: 2,
      limit: 20,
    });
    expect(response.body).toEqual({
      status: 200,
      message: 'Usuarios obtenidos exitosamente',
      data: {
        data: users,
        meta: { page: 2, limit: 20, total: 21, totalPages: 2 },
      },
    });
  });

  it('aplica page=1 y limit=10 por defecto cuando no se envían filtros', async () => {
    await setup();
    mocks.getUsers.execute.mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    await request(app.getHttpServer()).get('/usuario').expect(200);

    expect(mocks.getUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it('exige JwtAuthGuard + RoleGuard con tres roles permitidos', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));
    expectUserGuards('findAll', {
      roles: [
        RolEnum.ADMINISTRADOR,
        RolEnum.SOPORTE_INSITU,
        RolEnum.SOPORTE_TECNICO,
      ],
    });
    mocks.getUsers.execute.mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    await request(app.getHttpServer()).get('/usuario').expect(200);

    expect(mocks.getUsers.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/usuario')
      .expect(401);

    expect(response.body.data).toBeNull();
    expect(mocks.getUsers.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para un rol de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_EMPRESA }));

    const response = await request(app.getHttpServer())
      .get('/usuario')
      .expect(403);

    expect(response.body).toEqual({
      status: 403,
      message: 'No tienes permisos para acceder a este recurso',
      data: null,
    });
    expect(mocks.getUsers.execute).not.toHaveBeenCalled();
  });

  it('rechaza filtros inválidos y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/usuario')
      .query({ page: 0, limit: 101, id_rol: 'abc', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('property extra should not exist');
    expect(response.body.message).toContain('id_rol debe ser un número entero');
    expect(mocks.getUsers.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 400 con data null', async () => {
    await setup();
    mocks.getUsers.execute.mockRejectedValue(
      new TestDomainException('Filtros inválidos'),
    );

    const response = await request(app.getHttpServer())
      .get('/usuario')
      .expect(400);

    expect(response.body).toEqual({
      status: 400,
      message: 'Filtros inválidos',
      data: null,
    });
  });

  it('caso borde: is_active=true se transforma correctamente', async () => {
    await setup();
    mocks.getUsers.execute.mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    await request(app.getHttpServer())
      .get('/usuario')
      .query({ is_active: 'true' })
      .expect(200);

    expect(mocks.getUsers.execute).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true }),
    );
  });
});
