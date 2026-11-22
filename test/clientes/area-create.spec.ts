import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { AreaController } from '@/clientes/infrastructure/controllers/area.controller';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';
import {
  ADMIN_ONLY,
  adminAuthState,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  TestDomainException,
  type ClientesUseCaseMocks,
} from './helpers';

describe('AreaController - POST /areas', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

  const validBody = {
    nombre_area: 'Área de Sistemas',
    contacto: 'María Gómez',
    telefono: '+51987654321',
    correo: 'sistemas@acme.com',
    id_sucursal: 2,
    is_active: true,
  };

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createClientesMocks();
    app = await createClientesTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con el DTO validado', async () => {
    await setup();
    const data = { id_area: 3, nombre_area: validBody.nombre_area };
    mocks.createArea.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/areas')
      .send(validBody)
      .expect(201);

    expect(mocks.createArea.execute).toHaveBeenCalledWith(validBody);
    expect(response.body).toEqual({
      status: 201,
      message: 'Área creada exitosamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectClientesGuards(AreaController, 'create', ADMIN_ONLY);
    mocks.createArea.execute.mockResolvedValue({ id_area: 3 });

    await request(app.getHttpServer()).post('/areas').send(validBody).expect(201);

    expect(mocks.createArea.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .post('/areas')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.createArea.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));

    const response = await request(app.getHttpServer())
      .post('/areas')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.createArea.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .post('/areas')
      .send({
        nombre_area: '',
        contacto: 'María Gómez',
        telefono: '+51987654321',
        correo: 'no-es-email',
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El nombre del área es obligatorio');
    expect(response.body.message).toContain('El correo electrónico debe ser válido');
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.createArea.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException SucursalNotFoundException en 404', async () => {
    await setup();
    mocks.createArea.execute.mockRejectedValue(new SucursalNotFoundException());

    const response = await request(app.getHttpServer())
      .post('/areas')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Sucursal no encontrada',
      data: null,
    });
  });

  it('convierte otra DomainException respetando su statusCode', async () => {
    await setup();
    mocks.createArea.execute.mockRejectedValue(
      new TestDomainException('Conflicto de negocio', 422),
    );

    const response = await request(app.getHttpServer())
      .post('/areas')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Conflicto de negocio',
      data: null,
    });
  });

  it('caso borde: is_active omitido sigue siendo válido (valor por defecto en dominio)', async () => {
    await setup();
    mocks.createArea.execute.mockResolvedValue({ id_area: 4 });
    const { is_active: _isActive, ...bodyWithoutIsActive } = validBody;

    await request(app.getHttpServer())
      .post('/areas')
      .send(bodyWithoutIsActive)
      .expect(201);

    expect(mocks.createArea.execute).toHaveBeenCalledOnce();
  });
});
