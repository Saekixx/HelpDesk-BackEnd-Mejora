import type { INestApplication } from '@nestjs/common';
import { BadRequestException, ConflictException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { EmailAlreadyInUseException } from '@/usuarios/domain/exceptions/user.exceptions';
import {
  adminAuthState,
  createUsuariosMocks,
  createUsuariosTestApp,
  expectUserGuards,
  type UsuariosUseCaseMocks,
} from './helpers';

describe('UsersController - POST /usuario/create', () => {
  let app: INestApplication;
  let mocks: UsuariosUseCaseMocks;

  const validBody = {
    nombre: 'Jack',
    apellido: 'Hernández',
    correo: 'jack@empresa.com',
    telefono: '+51987654321',
    id_rol: 2,
    id_cliente: 1,
  };

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createUsuariosMocks();
    app = await createUsuariosTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con CreateUserUseCase mockeado', async () => {
    await setup();
    const data = {
      message: 'Invitación enviada con éxito a jack@empresa.com.',
    };
    mocks.createUser.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/usuario/create')
      .send(validBody)
      .expect(201);

    expect(mocks.createUser.execute).toHaveBeenCalledWith(validBody);
    expect(response.body).toEqual({
      status: 201,
      message: 'Usuario creado exitosamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectUserGuards('create', { roles: [RolEnum.ADMINISTRADOR] });
    mocks.createUser.execute.mockResolvedValue({ message: 'ok' });

    await request(app.getHttpServer())
      .post('/usuario/create')
      .send(validBody)
      .expect(201);

    expect(mocks.createUser.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .post('/usuario/create')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.createUser.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles que no son ADMINISTRADOR', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));

    const response = await request(app.getHttpServer())
      .post('/usuario/create')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.createUser.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido con 400 (whitelist/forbidNonWhitelisted) y no llama al caso de uso', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .post('/usuario/create')
      .send({
        nombre: 'Jack',
        correo: 'no-es-email',
        id_rol: 2,
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El teléfono es obligatorio');
    expect(response.body.message).toContain(
      'El correo electrónico debe ser válido',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.createUser.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException EmailAlreadyInUseException en 409', async () => {
    await setup();
    mocks.createUser.execute.mockRejectedValue(
      new EmailAlreadyInUseException(),
    );

    const response = await request(app.getHttpServer())
      .post('/usuario/create')
      .send(validBody)
      .expect(409);

    expect(response.body).toEqual({
      status: 409,
      message: 'El correo electrónico ya está en uso',
      data: null,
    });
  });

  it('convierte BadRequestException y ConflictException de NestJS con data null', async () => {
    await setup();
    mocks.createUser.execute
      .mockRejectedValueOnce(new BadRequestException('Rol sin reglas definidas'))
      .mockRejectedValueOnce(new ConflictException('El rol no existe'));

    const badRequest = await request(app.getHttpServer())
      .post('/usuario/create')
      .send(validBody)
      .expect(400);
    const conflict = await request(app.getHttpServer())
      .post('/usuario/create')
      .send(validBody)
      .expect(409);

    expect(badRequest.body).toEqual({
      status: 400,
      message: 'Rol sin reglas definidas',
      data: null,
    });
    expect(conflict.body).toEqual({
      status: 409,
      message: 'El rol no existe',
      data: null,
    });
  });

  it('caso borde: campos opcionales omitidos permanecen válidos', async () => {
    await setup();
    mocks.createUser.execute.mockResolvedValue({ message: 'ok' });

    await request(app.getHttpServer())
      .post('/usuario/create')
      .send({
        nombre: 'Jack',
        apellido: 'Hernández',
        correo: 'jack@empresa.com',
        telefono: '+51987654321',
        id_rol: 1,
      })
      .expect(201);

    expect(mocks.createUser.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id_rol: 1 }),
    );
  });
});
