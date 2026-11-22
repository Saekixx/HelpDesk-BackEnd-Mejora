import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createPlanMocks,
  createPlanTestApp,
  expectNoGuardsOrRoles,
  TestDomainException,
  type PlanUseCaseMocks,
} from './helpers';

describe('PlanController - PATCH /planes/:id/status', () => {
  let app: INestApplication;
  let mocks: PlanUseCaseMocks;

  beforeEach(async () => {
    mocks = createPlanMocks();
    app = await createPlanTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con el mensaje del caso de uso', async () => {
    const message = 'El plan con ID 5 ahora está inactivo';
    mocks.toggleStatus.execute.mockResolvedValue(message);

    const response = await request(app.getHttpServer())
      .patch('/planes/5/status')
      .expect(200);

    expect(mocks.toggleStatus.execute).toHaveBeenCalledWith(5);
    expect(response.body).toEqual({
      status: 200,
      message,
      data: null,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('toggleStatus');
    mocks.toggleStatus.execute.mockResolvedValue(
      'El plan con ID 5 ahora está activo',
    );

    await request(app.getHttpServer()).patch('/planes/5/status').expect(200);

    expect(mocks.toggleStatus.execute).toHaveBeenCalledOnce();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe) y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .patch('/planes/abc/status')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.toggleStatus.execute).not.toHaveBeenCalled();
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    mocks.toggleStatus.execute.mockRejectedValue(
      new NotFoundException('El plan con ID 999 no existe'),
    );

    const response = await request(app.getHttpServer())
      .patch('/planes/999/status')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'El plan con ID 999 no existe',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.toggleStatus.execute.mockRejectedValue(
      new TestDomainException('No se pudo cambiar el estado', 422),
    );

    const response = await request(app.getHttpServer())
      .patch('/planes/5/status')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No se pudo cambiar el estado',
      data: null,
    });
  });

  it('caso borde: mensaje de activación se reenvía sin alterar', async () => {
    const message = 'El plan con ID 8 ahora está activo';
    mocks.toggleStatus.execute.mockResolvedValue(message);

    const response = await request(app.getHttpServer())
      .patch('/planes/8/status')
      .expect(200);

    expect(response.body.message).toBe(message);
    expect(response.body.data).toBeNull();
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    mocks.toggleStatus.execute.mockResolvedValue(
      'El plan con ID 0 ahora está activo',
    );

    await request(app.getHttpServer()).patch('/planes/0/status').expect(200);

    expect(mocks.toggleStatus.execute).toHaveBeenCalledWith(0);
  });
});
