import type { INestApplication } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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

describe('UsersController - PATCH /usuario/:id/rol', () => {
  let app: INestApplication;
  let mocks: UsuariosUseCaseMocks;

  const validBody = { id_rol: 2, id_cliente: 1, id_sucursal: 3 };

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
    mocks.assignRol.execute.mockResolvedValue(
      'Rol y asignaciones actualizados correctamente',
    );

    const response = await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send(validBody)
      .expect(200);

    expect(mocks.assignRol.execute).toHaveBeenCalledWith(5, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Rol y asignaciones actualizados correctamente',
      data: null,
    });
  });

  it('exige JwtAuthGuard + RoleGuard y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectUserGuards('updateRole', { roles: [RolEnum.ADMINISTRADOR] });
    mocks.assignRol.execute.mockResolvedValue('ok');

    await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send(validBody)
      .expect(200);

    expect(mocks.assignRol.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.assignRol.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_EMPRESA }));

    const response = await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.assignRol.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/usuario/abc/rol')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.assignRol.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send({ extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El ID de rol es obligatorio');
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.assignRol.execute).not.toHaveBeenCalled();
  });

  it('convierte excepciones de dominio y de NestJS con data null', async () => {
    await setup();
    mocks.assignRol.execute
      .mockRejectedValueOnce(new UserNotFoundException())
      .mockRejectedValueOnce(new NotFoundException('El rol especificado no existe'))
      .mockRejectedValueOnce(
        new BadRequestException(
          'El rol CLIENTE_TRABAJADOR requiere cliente/empresa, sucursal y área',
        ),
      );

    const domainError = await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send(validBody)
      .expect(404);
    const notFound = await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send(validBody)
      .expect(404);
    const badRequest = await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send(validBody)
      .expect(400);

    expect(domainError.body.message).toBe('Usuario no encontrado');
    expect(notFound.body.message).toBe('El rol especificado no existe');
    expect(badRequest.body).toEqual({
      status: 400,
      message:
        'El rol CLIENTE_TRABAJADOR requiere cliente/empresa, sucursal y área',
      data: null,
    });
  });

  it('caso borde: ids opcionales omitidos llegan como dto mínimo', async () => {
    await setup();
    mocks.assignRol.execute.mockResolvedValue('ok');

    await request(app.getHttpServer())
      .patch('/usuario/5/rol')
      .send({ id_rol: 1 })
      .expect(200);

    expect(mocks.assignRol.execute).toHaveBeenCalledWith(5, { id_rol: 1 });
  });
});
