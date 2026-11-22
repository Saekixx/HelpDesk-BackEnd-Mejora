import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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

describe('UsersController - GET /usuario/estadisticas', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con GetUserStatsUseCase mockeado', async () => {
    await setup();
    const stats = {
      total: 10,
      activos: 7,
      inactivos: 3,
      porRol: { ADMINISTRADOR: 2, SOPORTE_TECNICO: 5 },
    };
    mocks.getUserStats.execute.mockResolvedValue(stats);

    const response = await request(app.getHttpServer())
      .get('/usuario/estadisticas')
      .expect(200);

    expect(mocks.getUserStats.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Estadísticas de usuarios obtenidas exitosamente',
      data: stats,
    });
  });

  it('exige JwtAuthGuard + RoleGuard y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectUserGuards('getEstadisticas', { roles: [RolEnum.ADMINISTRADOR] });

    await request(app.getHttpServer())
      .get('/usuario/estadisticas')
      .expect(200);

    expect(mocks.getUserStats.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/usuario/estadisticas')
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Token inválido o expirado',
      data: null,
    });
    expect(mocks.getUserStats.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 si el rol no está autorizado (SOPORTE_TECNICO)', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));

    const response = await request(app.getHttpServer())
      .get('/usuario/estadisticas')
      .expect(403);

    expect(response.body).toEqual({
      status: 403,
      message: 'No tienes permisos para acceder a este recurso',
      data: null,
    });
    expect(mocks.getUserStats.execute).not.toHaveBeenCalled();
  });

  it('convierte NotFoundException del caso de uso en 404 con data null', async () => {
    await setup();
    mocks.getUserStats.execute.mockRejectedValue(
      new NotFoundException('Estadísticas no disponibles'),
    );

    const response = await request(app.getHttpServer())
      .get('/usuario/estadisticas')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Estadísticas no disponibles',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    await setup();
    mocks.getUserStats.execute.mockRejectedValue(
      new TestDomainException('Dominio inválido', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/usuario/estadisticas')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Dominio inválido',
      data: null,
    });
  });

  it('caso borde: estadísticas en cero se devuelven sin alterar', async () => {
    await setup();
    const stats = { total: 0, activos: 0, inactivos: 0, porRol: {} };
    mocks.getUserStats.execute.mockResolvedValue(stats);

    const response = await request(app.getHttpServer())
      .get('/usuario/estadisticas')
      .expect(200);

    expect(response.body.data).toEqual(stats);
  });
});
