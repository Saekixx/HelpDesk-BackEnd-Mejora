import type { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { UserNotFoundException } from '@/usuarios/domain/exceptions/user.exceptions';
import {
  adminAuthState,
  createUsuariosMocks,
  createUsuariosTestApp,
  expectUserGuards,
  type UsuariosUseCaseMocks,
} from './helpers';

describe('UsersController - PATCH /usuario/:id/status', () => {
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

  it('devuelve 200 con el mensaje del caso de uso y el currentUserId inyectado (@CurrentUser)', async () => {
    await setup(adminAuthState({ userId: 99 }));
    mocks.toggleUserStatus.execute.mockResolvedValue(
      'Usuario desactivado correctamente',
    );

    const response = await request(app.getHttpServer())
      .patch('/usuario/5/status')
      .expect(200);

    expect(mocks.toggleUserStatus.execute).toHaveBeenCalledWith(5, 99);
    expect(response.body).toEqual({
      status: 200,
      message: 'Usuario desactivado correctamente',
      data: null,
    });
  });

  it('exige JwtAuthGuard + RoleGuard y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectUserGuards('toggleStatus', { roles: [RolEnum.ADMINISTRADOR] });
    mocks.toggleUserStatus.execute.mockResolvedValue('ok');

    await request(app.getHttpServer())
      .patch('/usuario/5/status')
      .expect(200);

    expect(mocks.toggleUserStatus.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/usuario/5/status')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.toggleUserStatus.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));

    const response = await request(app.getHttpServer())
      .patch('/usuario/5/status')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.toggleUserStatus.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/usuario/abc/status')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.toggleUserStatus.execute).not.toHaveBeenCalled();
  });

  it('convierte BadRequestException (autodesactivación) en 400 con data null', async () => {
    await setup();
    mocks.toggleUserStatus.execute.mockRejectedValue(
      new BadRequestException('No puedes desactivar tu propia cuenta'),
    );

    const response = await request(app.getHttpServer())
      .patch('/usuario/99/status')
      .expect(400);

    expect(response.body).toEqual({
      status: 400,
      message: 'No puedes desactivar tu propia cuenta',
      data: null,
    });
  });

  it('convierte UserNotFoundException (DomainException) en 404 con data null', async () => {
    await setup();
    mocks.toggleUserStatus.execute.mockRejectedValue(
      new UserNotFoundException(),
    );

    const response = await request(app.getHttpServer())
      .patch('/usuario/999/status')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Usuario no encontrado',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo reenvía al caso de uso', async () => {
    await setup();
    mocks.toggleUserStatus.execute.mockResolvedValue('ok');

    await request(app.getHttpServer())
      .patch('/usuario/0/status')
      .expect(200);

    expect(mocks.toggleUserStatus.execute).toHaveBeenCalledWith(0, 99);
  });
});
