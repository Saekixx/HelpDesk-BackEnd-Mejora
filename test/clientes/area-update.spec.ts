import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { AreaController } from '@/clientes/infrastructure/controllers/area.controller';
import { AreaNotFoundException } from '@/clientes/domain/exceptions/area.exceptions';
import {
  ADMIN_ONLY,
  adminAuthState,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  type ClientesUseCaseMocks,
} from './helpers';

describe('AreaController - PATCH /areas/:id', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

  const validBody = { nombre_area: 'Área de Sistemas Actualizada' };

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
    const data = { id_area: 5, nombre_area: validBody.nombre_area };
    mocks.updateArea.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .patch('/areas/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateArea.execute).toHaveBeenCalledWith(5, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Área actualizada exitosamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectClientesGuards(AreaController, 'update', ADMIN_ONLY);
    mocks.updateArea.execute.mockResolvedValue({ id_area: 5 });

    await request(app.getHttpServer())
      .patch('/areas/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateArea.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/areas/5')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.updateArea.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles no administradores', async () => {
    await setup(adminAuthState({ role: RolEnum.CLIENTE_EMPRESA }));

    const response = await request(app.getHttpServer())
      .patch('/areas/5')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.updateArea.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/areas/abc')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.updateArea.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO inválido y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .patch('/areas/5')
      .send({
        nombre_area: '',
        contacto: '',
        telefono: '',
        correo: 'no-es-email',
        id_sucursal: 'abc',
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El nombre del área es obligatorio');
    expect(response.body.message).toContain('El contacto es obligatorio');
    expect(response.body.message).toContain('El correo electrónico debe ser válido');
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.updateArea.execute).not.toHaveBeenCalled();
  });

  it('convierte AreaNotFoundException (DomainException) en 404 con data null', async () => {
    await setup();
    mocks.updateArea.execute.mockRejectedValue(new AreaNotFoundException());

    const response = await request(app.getHttpServer())
      .patch('/areas/999')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Área no encontrada',
      data: null,
    });
  });

  it('caso borde: PATCH con un solo campo opcional se reenvía sin alterar', async () => {
    await setup();
    mocks.updateArea.execute.mockResolvedValue({ id_area: 5 });

    await request(app.getHttpServer())
      .patch('/areas/5')
      .send({ is_active: false })
      .expect(200);

    expect(mocks.updateArea.execute).toHaveBeenCalledWith(5, {
      is_active: false,
    });
  });
});
