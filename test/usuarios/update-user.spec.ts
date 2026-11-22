import type { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
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

describe('UsersController - PATCH /usuario/:id', () => {
  let app: INestApplication;
  let mocks: UsuariosUseCaseMocks;

  const validBody = { nombre: 'Jack', correo: 'jack@empresa.com', id_rol: 2 };

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
    const user = { id_usuario: 5, nombre: 'Jack Update' };
    mocks.updateUser.execute.mockResolvedValue(user);

    const response = await request(app.getHttpServer())
      .patch('/usuario/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateUser.execute).toHaveBeenCalledWith(5, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Usuario actualizado exitosamente',
      data: user,
    });
  });

  it('exige JwtAuthGuard + RoleGuard y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectUserGuards('updateUser', { roles: [RolEnum.ADMINISTRADOR] });
    mocks.updateUser.execute.mockResolvedValue({ id_usuario: 5 });

    await request(app.getHttpServer())
      .patch('/usuario/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateUser.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/usuario/5')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.updateUser.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));

    const response = await request(app.getHttpServer())
      .patch('/usuario/5')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.updateUser.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/usuario/abc')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.updateUser.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/usuario/5')
      .send({
        nombre: '',
        correo: 'no-es-email',
        zonas_ids: 'no-arreglo',
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El nombre no puede estar vacío');
    expect(response.body.message).toContain(
      'El correo electrónico debe ser una dirección válida',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.updateUser.execute).not.toHaveBeenCalled();
  });

  it('convierte excepciones de dominio y de NestJS con data null', async () => {
    await setup();
    mocks.updateUser.execute
      .mockRejectedValueOnce(new UserNotFoundException())
      .mockRejectedValueOnce(new EmailAlreadyInUseException())
      .mockRejectedValueOnce(new BadRequestException('Rol sin reglas'));

    const notFound = await request(app.getHttpServer())
      .patch('/usuario/5')
      .send(validBody)
      .expect(404);
    const conflict = await request(app.getHttpServer())
      .patch('/usuario/5')
      .send(validBody)
      .expect(409);
    const badRequest = await request(app.getHttpServer())
      .patch('/usuario/5')
      .send(validBody)
      .expect(400);

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
    expect(badRequest.body).toEqual({
      status: 400,
      message: 'Rol sin reglas',
      data: null,
    });
  });

  it('caso borde: zonas_ids vacío pasa la validación de DTO y llega al caso de uso', async () => {
    await setup();
    mocks.updateUser.execute.mockResolvedValue({ id_usuario: 5 });

    await request(app.getHttpServer())
      .patch('/usuario/5')
      .send({ zonas_ids: [] })
      .expect(200);

    expect(mocks.updateUser.execute).toHaveBeenCalledWith(5, {
      zonas_ids: [],
    });
  });
});
