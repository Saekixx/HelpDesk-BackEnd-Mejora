import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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

describe('SucursalController - PATCH /sucursales/:id/toggle-status', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

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
    const data = { id_sucursal: 5, is_active: false };
    mocks.toggleSucursalStatus.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .patch('/sucursales/5/toggle-status')
      .expect(200);

    expect(mocks.toggleSucursalStatus.execute).toHaveBeenCalledWith(5);
    expect(response.body).toEqual({
      status: 200,
      message: 'Estado de la sucursal actualizado exitosamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectClientesGuards(SucursalController, 'toggleStatus', ADMIN_ONLY);
    mocks.toggleSucursalStatus.execute.mockResolvedValue({ id_sucursal: 5 });

    await request(app.getHttpServer())
      .patch('/sucursales/5/toggle-status')
      .expect(200);

    expect(mocks.toggleSucursalStatus.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/sucursales/5/toggle-status')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.toggleSucursalStatus.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_INSITU }));

    const response = await request(app.getHttpServer())
      .patch('/sucursales/5/toggle-status')
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.toggleSucursalStatus.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/sucursales/abc/toggle-status')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.toggleSucursalStatus.execute).not.toHaveBeenCalled();
  });

  it('convierte excepciones de dominio y de NestJS en data null', async () => {
    await setup();
    mocks.toggleSucursalStatus.execute
      .mockRejectedValueOnce(new SucursalNotFoundException())
      .mockRejectedValueOnce(new NotFoundException('Sucursal inexistente'));

    const domainError = await request(app.getHttpServer())
      .patch('/sucursales/999/toggle-status')
      .expect(404);
    const nestError = await request(app.getHttpServer())
      .patch('/sucursales/999/toggle-status')
      .expect(404);

    expect(domainError.body).toEqual({
      status: 404,
      message: 'Sucursal no encontrada',
      data: null,
    });
    expect(nestError.body).toEqual({
      status: 404,
      message: 'Sucursal inexistente',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo reenvía al caso de uso', async () => {
    await setup();
    mocks.toggleSucursalStatus.execute.mockResolvedValue({ id_sucursal: 0 });

    await request(app.getHttpServer())
      .patch('/sucursales/0/toggle-status')
      .expect(200);

    expect(mocks.toggleSucursalStatus.execute).toHaveBeenCalledWith(0);
  });
});
