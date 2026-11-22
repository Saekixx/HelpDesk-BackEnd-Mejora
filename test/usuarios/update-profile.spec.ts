import type { INestApplication } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
} from '@/usuarios/domain/exceptions/user.exceptions';
import {
  adminAuthState,
  createUsuariosMocks,
  createUsuariosTestApp,
  expectUserGuards,
  type UsuariosUseCaseMocks,
} from './helpers';

describe('UsersController - PATCH /usuario/perfil', () => {
  let app: INestApplication;
  let mocks: UsuariosUseCaseMocks;

  const validBody = { currentPassword: '12345678', nombre: 'Jack' };

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createUsuariosMocks();
    app = await createUsuariosTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 200 con el mensaje del caso de uso como { status, message, data: null }', async () => {
    await setup();
    mocks.updateProfile.execute.mockResolvedValue(
      'Perfil actualizado exitosamente',
    );

    const response = await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send(validBody)
      .expect(200);

    expect(mocks.updateProfile.execute).toHaveBeenCalledWith(99, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Perfil actualizado exitosamente',
      data: null,
    });
  });

  it('inyecta el userId del guard simulado (@CurrentUser)', async () => {
    await setup(adminAuthState({ userId: 314 }));
    mocks.updateProfile.execute.mockResolvedValue('ok');

    await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send(validBody)
      .expect(200);

    expect(mocks.updateProfile.execute).toHaveBeenCalledWith(314, validBody);
  });

  it('solo exige JwtAuthGuard: sin RoleGuard ni @Roles', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_TRABAJADOR }));
    expectUserGuards('update');
    mocks.updateProfile.execute.mockResolvedValue('ok');

    await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send(validBody)
      .expect(200);

    expect(mocks.updateProfile.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.updateProfile.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send({ currentPassword: '', newPassword: '123', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'La nueva contraseña debe tener al menos 6 caracteres',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.updateProfile.execute).not.toHaveBeenCalled();
  });

  it('convierte UnauthorizedException (contraseña actual incorrecta) en 401', async () => {
    await setup();
    mocks.updateProfile.execute.mockRejectedValue(
      new UnauthorizedException('Contraseña actual incorrecta'),
    );

    const response = await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send(validBody)
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Contraseña actual incorrecta',
      data: null,
    });
  });

  it('convierte excepciones de dominio en sus statusCode respectivos', async () => {
    await setup();
    mocks.updateProfile.execute
      .mockRejectedValueOnce(new UserNotFoundException())
      .mockRejectedValueOnce(new EmailAlreadyInUseException());

    const notFound = await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send(validBody)
      .expect(404);
    const conflict = await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send(validBody)
      .expect(409);

    expect(notFound.body).toEqual({
      status: 404,
      message: 'Usuario no encontrado',
      data: null,
    });
    expect(conflict.body).toEqual({
      status: 409,
      message: 'El correo electrónico ya está en uso',
      data: null,
    });
  });

  it('caso borde: solo currentPassword es suficiente', async () => {
    await setup();
    mocks.updateProfile.execute.mockResolvedValue('ok');

    await request(app.getHttpServer())
      .patch('/usuario/perfil')
      .send({ currentPassword: '12345678' })
      .expect(200);

    expect(mocks.updateProfile.execute).toHaveBeenCalledWith(99, {
      currentPassword: '12345678',
    });
  });
});
