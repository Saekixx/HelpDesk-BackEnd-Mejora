import type { INestApplication } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createAuthMocks,
  createAuthTestApp,
  expectNoGuardsOrRoles,
  TestDomainException,
  type AuthUseCaseMocks,
} from './helpers';

describe('AuthController - POST /auth/login', () => {
  let app: INestApplication;
  let mocks: AuthUseCaseMocks;

  const validBody = { correo: 'jack@empresa.com', password: '12345678' };

  beforeEach(async () => {
    mocks = createAuthMocks();
    app = await createAuthTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con LoginUseCase mockeado', async () => {
    const data = {
      token: 'jwt-token',
      user: { nombre: 'Jack', correo: validBody.correo, role: 'ADMINISTRADOR' },
    };
    mocks.login.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(validBody)
      .expect(200);

    expect(mocks.login.execute).toHaveBeenCalledWith(
      validBody.correo,
      validBody.password,
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Login exitoso',
      data,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('login');
    mocks.login.execute.mockResolvedValue({ token: 'jwt-token' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(validBody)
      .expect(200);

    expect(mocks.login.execute).toHaveBeenCalledOnce();
  });

  it('rechaza DTO inválido con 400 y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: 'no-es-email', password: '123', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El correo electrónico debe ser un email válido',
    );
    expect(response.body.message).toContain(
      'La contraseña debe tener al menos 6 caracteres',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.login.execute).not.toHaveBeenCalled();
  });

  it('convierte UnauthorizedException del caso de uso en 401 con data null', async () => {
    mocks.login.execute.mockRejectedValue(
      new UnauthorizedException('Credenciales inválidas'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(validBody)
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Credenciales inválidas',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.login.execute.mockRejectedValue(
      new TestDomainException('Dominio inválido', 422),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Dominio inválido',
      data: null,
    });
  });

  it('caso borde: password de exactamente 6 caracteres es válido', async () => {
    mocks.login.execute.mockResolvedValue({ token: 'jwt-token' });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ correo: 'a@b.com', password: '123456' })
      .expect(200);

    expect(mocks.login.execute).toHaveBeenCalledWith('a@b.com', '123456');
  });
});
