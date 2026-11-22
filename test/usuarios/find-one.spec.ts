import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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

describe('UsersController - GET /usuario/:id', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con el id parseado', async () => {
    await setup();
    const user = { id_usuario: 7, nombre: 'Jack', correo: 'jack@empresa.com' };
    mocks.getUserById.execute.mockResolvedValue(user);

    const response = await request(app.getHttpServer())
      .get('/usuario/7')
      .expect(200);

    expect(mocks.getUserById.execute).toHaveBeenCalledWith(7);
    expect(response.body).toEqual({
      status: 200,
      message: 'Usuario obtenido exitosamente',
      data: user,
    });
  });

  it('exige JwtAuthGuard + RoleGuard con los tres roles de soporte/administración', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));
    expectUserGuards('findOne', {
      roles: [
        RolEnum.ADMINISTRADOR,
        RolEnum.SOPORTE_INSITU,
        RolEnum.SOPORTE_TECNICO,
      ],
    });
    mocks.getUserById.execute.mockResolvedValue({ id_usuario: 7 });

    await request(app.getHttpServer()).get('/usuario/7').expect(200);

    expect(mocks.getUserById.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/usuario/7')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getUserById.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para un rol no autorizado', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_SUCURSAL }));

    const response = await request(app.getHttpServer())
      .get('/usuario/7')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.getUserById.execute).not.toHaveBeenCalled();
  });

  it('rechaza un id no numérico con 400 mediante ParseIntPipe', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/usuario/abc')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.getUserById.execute).not.toHaveBeenCalled();
  });

  it('convierte UserNotFoundException (DomainException) en 404 con data null', async () => {
    await setup();
    mocks.getUserById.execute.mockRejectedValue(new UserNotFoundException());

    const response = await request(app.getHttpServer())
      .get('/usuario/999')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Usuario no encontrado',
      data: null,
    });
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    await setup();
    mocks.getUserById.execute.mockRejectedValue(
      new NotFoundException('Usuario inexistente'),
    );

    const response = await request(app.getHttpServer())
      .get('/usuario/999')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Usuario inexistente',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    await setup();
    mocks.getUserById.execute.mockResolvedValue({ id_usuario: 0 });

    await request(app.getHttpServer()).get('/usuario/0').expect(200);

    expect(mocks.getUserById.execute).toHaveBeenCalledWith(0);
  });
});
