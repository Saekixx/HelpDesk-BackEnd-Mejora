import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import {
  adminAuthState,
  createUsuariosMocks,
  createUsuariosTestApp,
  expectRolesControllerIsPublic,
  TestDomainException,
  type UsuariosUseCaseMocks,
} from './helpers';

describe('RolesController - GET /role/options', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con GetRolesUseCase mockeado', async () => {
    await setup();
    const roles = [
      { id_rol: 1, nombre: 'ADMINISTRADOR' },
      { id_rol: 2, nombre: 'SOPORTE_TECNICO' },
    ];
    mocks.getRoles.execute.mockResolvedValue(roles);

    const response = await request(app.getHttpServer())
      .get('/role/options')
      .expect(200);

    expect(mocks.getRoles.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Roles obtenidos exitosamente',
      data: roles,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles', async () => {
    await setup(adminAuthState({ authenticated: false }));
    expectRolesControllerIsPublic();
    mocks.getRoles.execute.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/role/options').expect(200);

    expect(mocks.getRoles.execute).toHaveBeenCalledOnce();
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    await setup();
    mocks.getRoles.execute.mockRejectedValue(
      new TestDomainException('No hay roles disponibles', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/role/options')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No hay roles disponibles',
      data: null,
    });
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    await setup();
    mocks.getRoles.execute.mockRejectedValue(
      new NotFoundException('Roles no encontrados'),
    );

    const response = await request(app.getHttpServer())
      .get('/role/options')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Roles no encontrados',
      data: null,
    });
  });

  it('caso borde: lista vacía de roles se devuelve sin error', async () => {
    await setup();
    mocks.getRoles.execute.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/role/options')
      .expect(200);

    expect(response.body.data).toEqual([]);
  });
});
