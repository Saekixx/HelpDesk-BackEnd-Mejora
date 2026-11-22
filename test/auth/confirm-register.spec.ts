import type { INestApplication } from '@nestjs/common';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createAuthMocks,
  createAuthTestApp,
  expectNoGuardsOrRoles,
  type AuthUseCaseMocks,
} from './helpers';

describe('AuthController - POST /auth/confirm-register', () => {
  let app: INestApplication;
  let mocks: AuthUseCaseMocks;

  const validBody = { token: 'token-verificacion', password: '12345678' };
  const user = { id_usuario: 1, nombre: 'Jack', correo: 'jack@empresa.com' };

  beforeEach(async () => {
    mocks = createAuthMocks();
    app = await createAuthTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con ConfirmRegisterUseCase mockeado', async () => {
    mocks.confirmRegister.execute.mockResolvedValue(user);

    const response = await request(app.getHttpServer())
      .post('/auth/confirm-register')
      .send(validBody)
      .expect(201);

    expect(mocks.confirmRegister.execute).toHaveBeenCalledWith(validBody);
    expect(response.body).toEqual({
      status: 201,
      message: 'Cuenta activada y contraseña establecida con éxito',
      data: user,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('confirmRegister');
    mocks.confirmRegister.execute.mockResolvedValue(user);

    await request(app.getHttpServer())
      .post('/auth/confirm-register')
      .send(validBody)
      .expect(201);

    expect(mocks.confirmRegister.execute).toHaveBeenCalledOnce();
  });

  it('rechaza DTO inválido con 400 y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/confirm-register')
      .send({ password: '123', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El token de verificación es obligatorio',
    );
    expect(response.body.message).toContain(
      'La contraseña debe tener al menos 6 caracteres',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.confirmRegister.execute).not.toHaveBeenCalled();
  });

  it('convierte UnauthorizedException del caso de uso en 401 con data null', async () => {
    mocks.confirmRegister.execute.mockRejectedValue(
      new UnauthorizedException('El enlace de verificación es inválido o ha expirado'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/confirm-register')
      .send(validBody)
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'El enlace de verificación es inválido o ha expirado',
      data: null,
    });
  });

  it('convierte ConflictException del caso de uso en 409 con data null', async () => {
    mocks.confirmRegister.execute.mockRejectedValue(
      new ConflictException('Esta cuenta ya ha sido confirmada previamente'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/confirm-register')
      .send(validBody)
      .expect(409);

    expect(response.body).toEqual({
      status: 409,
      message: 'Esta cuenta ya ha sido confirmada previamente',
      data: null,
    });
  });

  it('caso borde: el status explícito del controlador no sobrescribe el status HTTP', async () => {
    mocks.confirmRegister.execute.mockResolvedValue(user);

    const response = await request(app.getHttpServer())
      .post('/auth/confirm-register')
      .send({ token: 'token', password: '123456' })
      .expect(201);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe(201);
  });
});
