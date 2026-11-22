import type { INestApplication } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createAuthMocks,
  createAuthTestApp,
  expectNoGuardsOrRoles,
  type AuthUseCaseMocks,
} from './helpers';

describe('AuthController - POST /auth/register', () => {
  let app: INestApplication;
  let mocks: AuthUseCaseMocks;

  const validBody = {
    nombre: 'Jack',
    apellido: 'Hernández',
    correo: 'jack@empresa.com',
    password: '12345678',
    id_rol: 1,
    id_cliente: 1,
    id_sucursal: 2,
    id_area: 3,
  };

  beforeEach(async () => {
    mocks = createAuthMocks();
    app = await createAuthTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con RegisterUseCase mockeado', async () => {
    const data = { accessToken: 'access-token' };
    mocks.register.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validBody)
      .expect(201);

    expect(mocks.register.execute).toHaveBeenCalledWith(validBody);
    expect(response.body).toEqual({
      status: 201,
      message: 'Usuario registrado exitosamente',
      data,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('register');
    mocks.register.execute.mockResolvedValue({ accessToken: 'token' });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(validBody)
      .expect(201);

    expect(mocks.register.execute).toHaveBeenCalledOnce();
  });

  it('rechaza DTO inválido con 400 y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: 'Jack',
        correo: 'no-es-email',
        password: '123',
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El correo debe ser un email válido',
    );
    expect(response.body.message).toContain(
      'La contraseña debe tener mínimo 6 caracteres',
    );
    expect(response.body.message).toContain('id_rol must be a number');
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.register.execute).not.toHaveBeenCalled();
  });

  it('convierte ConflictException del caso de uso en 409 con data null', async () => {
    mocks.register.execute.mockRejectedValue(
      new ConflictException('El correo ya se encuentra registrado'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validBody)
      .expect(409);

    expect(response.body).toEqual({
      status: 409,
      message: 'El correo ya se encuentra registrado',
      data: null,
    });
  });

  it('caso borde: campos opcionales omitidos siguen siendo válidos', async () => {
    mocks.register.execute.mockResolvedValue({ accessToken: 'token' });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: 'Jack',
        correo: 'jack@empresa.com',
        password: '123456',
        id_rol: 1,
      })
      .expect(201);

    expect(mocks.register.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Jack',
        correo: 'jack@empresa.com',
        password: '123456',
        id_rol: 1,
      }),
    );
  });
});
