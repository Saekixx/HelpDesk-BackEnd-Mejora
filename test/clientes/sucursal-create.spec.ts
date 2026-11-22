import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { SucursalController } from '@/clientes/infrastructure/controllers/sucursal.controller';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import {
  ADMIN_ONLY,
  adminAuthState,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  TestDomainException,
  type ClientesUseCaseMocks,
} from './helpers';

describe('SucursalController - POST /sucursales', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

  const validBody = {
    id_cliente: 1,
    nombre_sucursal: 'Sucursal Centro',
    direccion: 'Av. Siempre Viva 123',
    id_zona: 2,
    encargado: {
      nombre: 'María',
      apellido: 'Gómez',
      telefono_contacto: '987654321',
      correo_corporativo: 'maria.gomez@acme.com',
    },
  };

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createClientesMocks();
    app = await createClientesTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con el body anidado validado', async () => {
    await setup();
    const data = { id_sucursal: 3, id_cliente: 1 };
    mocks.createSucursal.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/sucursales')
      .send(validBody)
      .expect(201);

    expect(mocks.createSucursal.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        id_cliente: 1,
        nombre_sucursal: 'Sucursal Centro',
        encargado: expect.objectContaining({
          correo_corporativo: 'maria.gomez@acme.com',
        }),
      }),
    );
    expect(response.body).toEqual({
      status: 201,
      message: 'Sucursal y cuenta de encargado local creadas correctamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectClientesGuards(SucursalController, 'create', ADMIN_ONLY);
    mocks.createSucursal.execute.mockResolvedValue({ id_sucursal: 3 });

    await request(app.getHttpServer())
      .post('/sucursales')
      .send(validBody)
      .expect(201);

    expect(mocks.createSucursal.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .post('/sucursales')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.createSucursal.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));

    const response = await request(app.getHttpServer())
      .post('/sucursales')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.createSucursal.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .post('/sucursales')
      .send({
        nombre_sucursal: '',
        direccion: 'Av. Siempre Viva 123',
        encargado: {
          nombre: 'María',
          apellido: 'Gómez',
          telefono_contacto: '987654321',
          correo_corporativo: 'no-es-email',
        },
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El ID de cliente es obligatorio');
    expect(response.body.message).toContain(
      'El nombre de la sucursal es obligatorio',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.createSucursal.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException ClienteNotFoundException en 404', async () => {
    await setup();
    mocks.createSucursal.execute.mockRejectedValue(
      new ClienteNotFoundException(),
    );

    const response = await request(app.getHttpServer())
      .post('/sucursales')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Cliente no encontrado',
      data: null,
    });
  });

  it('convierte otra DomainException respetando su statusCode', async () => {
    await setup();
    mocks.createSucursal.execute.mockRejectedValue(
      new TestDomainException('Conflicto de negocio', 422),
    );

    const response = await request(app.getHttpServer())
      .post('/sucursales')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Conflicto de negocio',
      data: null,
    });
  });

  it('caso borde: campos opcionales id_zona e is_active omitidos siguen siendo válidos', async () => {
    await setup();
    mocks.createSucursal.execute.mockResolvedValue({ id_sucursal: 4 });

    await request(app.getHttpServer())
      .post('/sucursales')
      .send({
        id_cliente: 1,
        nombre_sucursal: 'Sucursal Sin Zona',
        direccion: 'Av. Siempre Viva 123',
        encargado: validBody.encargado,
      })
      .expect(201);

    expect(mocks.createSucursal.execute).toHaveBeenCalledOnce();
  });
});
