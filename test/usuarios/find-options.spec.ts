import type { INestApplication } from '@nestjs/common';
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

describe('UsersController - GET /usuario/options', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con los filtros transformados', async () => {
    await setup();
    const options = [
      { id_usuario: 1, nombre: 'Jack', correo: 'jack@empresa.com' },
    ];
    mocks.getUserOption.execute.mockResolvedValue(options);

    const response = await request(app.getHttpServer())
      .get('/usuario/options')
      .query({
        search: 'Jack',
        id_sucursal: 2,
        id_area: 3,
        id_cliente: 1,
        rol: 'ADMINISTRADOR',
      })
      .expect(200);

    expect(mocks.getUserOption.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'Jack',
        id_sucursal: 2,
        id_area: 3,
        id_cliente: 1,
        rol: 'ADMINISTRADOR',
      }),
    );
    expect(response.body).toEqual({
      status: 200,
      message: 'Operación realizada con éxito',
      data: options,
    });
  });

  it('solo exige JwtAuthGuard: sin RoleGuard ni @Roles, y funciona con rol de cliente', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_TRABAJADOR }));
    expectUserGuards('findOptions');
    mocks.getUserOption.execute.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/usuario/options').expect(200);

    expect(mocks.getUserOption.execute).toHaveBeenCalledOnce();
  });

  it('rechaza la petición sin autenticación con 401 y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/usuario/options')
      .expect(401);

    expect(response.body).toEqual({
      status: 401,
      message: 'Token inválido o expirado',
      data: null,
    });
    expect(mocks.getUserOption.execute).not.toHaveBeenCalled();
  });

  it('rechaza query params extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .get('/usuario/options')
      .query({ extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.getUserOption.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 404 con data null', async () => {
    await setup();
    mocks.getUserOption.execute.mockRejectedValue(new UserNotFoundException());

    const response = await request(app.getHttpServer())
      .get('/usuario/options')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Usuario no encontrado',
      data: null,
    });
  });

  it('caso borde: sin filtros devuelve una lista vacía sin lanzar errores', async () => {
    await setup();
    mocks.getUserOption.execute.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/usuario/options')
      .expect(200);

    expect(mocks.getUserOption.execute).toHaveBeenCalledOnce();
    expect(response.body.data).toEqual([]);
  });
});
