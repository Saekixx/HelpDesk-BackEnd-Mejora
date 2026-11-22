import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createAuthMocks,
  createAuthTestApp,
  expectNoGuardsOrRoles,
  type AuthUseCaseMocks,
} from './helpers';

describe('AuthController - POST /auth/forgot-password', () => {
  let app: INestApplication;
  let mocks: AuthUseCaseMocks;

  const genericMessage =
    'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.';
  const validBody = { correo: 'jack@empresa.com' };

  beforeEach(async () => {
    mocks = createAuthMocks();
    app = await createAuthTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con ForgotPasswordUseCase mockeado', async () => {
    mocks.forgotPassword.execute.mockResolvedValue({ message: genericMessage });

    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send(validBody)
      .expect(200);

    expect(mocks.forgotPassword.execute).toHaveBeenCalledWith(validBody.correo);
    expect(response.body).toEqual({
      status: 200,
      message: 'Operación realizada con éxito',
      data: { message: genericMessage },
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('forgotPassword');
    mocks.forgotPassword.execute.mockResolvedValue({ message: genericMessage });

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send(validBody)
      .expect(200);

    expect(mocks.forgotPassword.execute).toHaveBeenCalledOnce();
  });

  it('rechaza DTO inválido con 400 y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ correo: 'no-es-email', extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El correo electrónico no es válido',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.forgotPassword.execute).not.toHaveBeenCalled();
  });

  it('convierte un error inesperado del caso de uso en 500 con data null', async () => {
    mocks.forgotPassword.execute.mockRejectedValue(new Error('SMTP caído'));

    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send(validBody)
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'SMTP caído',
      data: null,
    });
  });

  it('caso borde: correo inexistente mantiene el mismo mensaje genérico sin filtrar información', async () => {
    mocks.forgotPassword.execute.mockResolvedValue({ message: genericMessage });

    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ correo: 'no-registrado@empresa.com' })
      .expect(200);

    expect(mocks.forgotPassword.execute).toHaveBeenCalledWith(
      'no-registrado@empresa.com',
    );
    expect(response.body.data).toEqual({ message: genericMessage });
    expect(JSON.stringify(response.body)).not.toContain('no existe');
    expect(JSON.stringify(response.body)).not.toContain('no registrado');
  });
});
