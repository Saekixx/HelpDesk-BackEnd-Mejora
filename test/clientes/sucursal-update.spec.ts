import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { SucursalController } from '@/clientes/infrastructure/controllers/sucursal.controller';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';
import {
  ADMIN_ONLY,
  adminAuthState,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  type ClientesUseCaseMocks,
} from './helpers';

describe('SucursalController - PATCH /sucursales/:id', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

  const validBody = { nombre_sucursal: 'Sucursal Centro Actualizada' };

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createClientesMocks();
    app = await createClientesTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con el id parseado', async () => {
    await setup();
    const data = {
      id_sucursal: 5,
      nombre_sucursal: 'Sucursal Centro Actualizada',
    };
    mocks.updateSucursal.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .patch('/sucursales/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateSucursal.execute).toHaveBeenCalledWith(5, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Sucursal actualizada exitosamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectClientesGuards(SucursalController, 'update', ADMIN_ONLY);
    mocks.updateSucursal.execute.mockResolvedValue({ id_sucursal: 5 });

    await request(app.getHttpServer())
      .patch('/sucursales/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateSucursal.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/sucursales/5')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.updateSucursal.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_SUCURSAL }));

    const response = await request(app.getHttpServer())
      .patch('/sucursales/5')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.updateSucursal.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/sucursales/abc')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.updateSucursal.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido, encargado con tipo inválido y extra con 400', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/sucursales/5')
      .send({
        nombre_sucursal: '',
        id_cliente: 0,
        id_zona: 'abc',
        encargado: 123,
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El nombre de la sucursal es obligatorio',
    );
    expect(response.body.message).toContain(
      'El encargado debe ser un texto con el nombre completo o un objeto con los datos del encargado',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.updateSucursal.execute).not.toHaveBeenCalled();
  });

  it('convierte SucursalNotFoundException (DomainException) en 404 con data null', async () => {
    await setup();
    mocks.updateSucursal.execute.mockRejectedValue(
      new SucursalNotFoundException(),
    );

    const response = await request(app.getHttpServer())
      .patch('/sucursales/999')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Sucursal no encontrada',
      data: null,
    });
  });

  it('caso borde: admite encargado como texto y lo reenvía sin alterar al caso de uso', async () => {
    await setup();
    mocks.updateSucursal.execute.mockResolvedValue({ id_sucursal: 5 });

    await request(app.getHttpServer())
      .patch('/sucursales/5')
      .send({ encargado: 'María Gómez' })
      .expect(200);

    expect(mocks.updateSucursal.execute).toHaveBeenCalledWith(5, {
      encargado: 'María Gómez',
    });
  });

  it('caso borde: id_zona=null desasigna la zona sin error', async () => {
    await setup();
    mocks.updateSucursal.execute.mockResolvedValue({ id_sucursal: 5 });

    await request(app.getHttpServer())
      .patch('/sucursales/5')
      .send({ id_zona: null })
      .expect(200);

    expect(mocks.updateSucursal.execute).toHaveBeenCalledWith(5, {
      id_zona: null,
    });
  });
});
