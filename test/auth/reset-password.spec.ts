import type { INestApplication } from '@nestjs/common';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createAuthMocks,
  createAuthTestApp,
  expectNoGuardsOrRoles,
  type AuthUseCaseMocks,
} from './helpers';

describe('AuthController - POST /auth/reset-password', () => {
  let app: INestApplication;
  let mocks: AuthUseCaseMocks;

  const validBody = { token: 'token-recuperacion', newPassword: 'Nueva123' };

  beforeEach(async () => {
    mocks = createAuthMocks();
    app = await createAuthTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con ResetPasswordUseCase mockeado', async () => {
    mocks.resetPassword.execute.mockResolvedValue({
      message: 'Contraseña actualizada con éxito',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send(validBody)
      .expect(200);

    expect(mocks.resetPassword.execute).toHaveBeenCalledWith(validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Operación realizada con éxito',
      data: { message: 'Contraseña actualizada con éxito' },
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('resetPassword');
    mocks.resetPassword.execute.mockResolvedValue({
      message: 'Contraseña actualizada con éxito',
    });

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send(validBody)
      .expect(200);

    expect(mocks.resetPassword.execute).toHaveBeenCalledOnce();
  });

  it('rechaza DTO inválido con 400 y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ newPassword: '123', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El token es obligatorio');
    expect(response.body.message).toContain(
      'La nueva contraseña debe tener al menos 6 caracteres',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.resetPassword.execute).not.toHaveBeenCalled();
  });

  it('convierte UnauthorizedException del caso de uso en 401 con data null', async () => {
    mocks.resetPassword.execute.mockRejectedValue(
      new UnauthorizedException('El enlace de recuperación es inválido o ha expirado'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send(validBody)
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'El enlace de recuperación es inválido o ha expirado',
      data: null,
    });
  });

  it('convierte NotFoundException del caso de uso en 404 con data null', async () => {
    mocks.resetPassword.execute.mockRejectedValue(
      new NotFoundException('Usuario no encontrado'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Usuario no encontrado',
      data: null,
    });
  });

  it('caso borde: nueva contraseña de exactamente 6 caracteres es válida', async () => {
    mocks.resetPassword.execute.mockResolvedValue({
      message: 'Contraseña actualizada con éxito',
    });

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: 'token', newPassword: '123456' })
      .expect(200);

    expect(mocks.resetPassword.execute).toHaveBeenCalledWith({
      token: 'token',
      newPassword: '123456',
    });
  });
});
