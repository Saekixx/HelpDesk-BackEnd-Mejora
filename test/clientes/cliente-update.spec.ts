import type { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { ClienteController } from '@/clientes/infrastructure/controllers/cliente.controller';
import {
  ADMIN_ONLY,
  adminAuthState,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  type ClientesUseCaseMocks,
} from './helpers';

describe('ClienteController - PATCH /clientes/:id', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

  const validBody = { nombre_principal: 'Acme Corp SAC', id_plan: 2 };

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
    const data = { id_cliente: 5, nombre_principal: 'Acme Corp SAC' };
    mocks.updateCliente.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .patch('/clientes/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateCliente.execute).toHaveBeenCalledWith(5, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Cliente actualizado exitosamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectClientesGuards(ClienteController, 'update', ADMIN_ONLY);
    mocks.updateCliente.execute.mockResolvedValue({ id_cliente: 5 });

    await request(app.getHttpServer())
      .patch('/clientes/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateCliente.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/clientes/5')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.updateCliente.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));

    const response = await request(app.getHttpServer())
      .patch('/clientes/5')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.updateCliente.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/clientes/abc')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.updateCliente.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/clientes/5')
      .send({
        nombre_principal: '   ',
        numero_documento: 'x'.repeat(21),
        rubro: '',
        id_plan: 0,
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('La razón social no puede estar vacía');
    expect(response.body.message).toContain(
      'El número de documento no puede exceder los 20 caracteres',
    );
    expect(response.body.message).toContain('El rubro no puede estar vacío');
    expect(response.body.message).toContain('El ID de plan debe ser un número positivo');
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.updateCliente.execute).not.toHaveBeenCalled();
  });

  it('convierte BadRequestException del caso de uso (PATCH vacío) en 400', async () => {
    await setup();
    mocks.updateCliente.execute.mockRejectedValue(
      new BadRequestException('Debe proporcionar al menos un campo para actualizar'),
    );

    const response = await request(app.getHttpServer())
      .patch('/clientes/5')
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      status: 400,
      message: 'Debe proporcionar al menos un campo para actualizar',
      data: null,
    });
  });

  it('caso borde: recorta espacios antes de validar y reenviar el campo', async () => {
    await setup();
    mocks.updateCliente.execute.mockResolvedValue({ id_cliente: 5 });

    await request(app.getHttpServer())
      .patch('/clientes/5')
      .send({ nombre_principal: '  Acme Corp  ' })
      .expect(200);

    expect(mocks.updateCliente.execute).toHaveBeenCalledWith(5, {
      nombre_principal: 'Acme Corp',
    });
  });
});
