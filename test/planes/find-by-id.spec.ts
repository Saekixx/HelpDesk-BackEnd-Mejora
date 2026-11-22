import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createPlanMocks,
  createPlanTestApp,
  expectNoGuardsOrRoles,
  TestDomainException,
  type PlanUseCaseMocks,
} from './helpers';

describe('PlanController - GET /planes/:id', () => {
  let app: INestApplication;
  let mocks: PlanUseCaseMocks;

  beforeEach(async () => {
    mocks = createPlanMocks();
    app = await createPlanTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con el id parseado', async () => {
    const plan = {
      id_plan: 7,
      numero_plan: 101,
      tipo: 'Empresarial',
      servicio: ['Soporte 24/7', 'Backups mensuales'],
      precio: 250.5,
      limite_equipos: 15,
      is_active: true,
    };
    mocks.findById.execute.mockResolvedValue(plan);

    const response = await request(app.getHttpServer())
      .get('/planes/7')
      .expect(200);

    expect(mocks.findById.execute).toHaveBeenCalledWith(7);
    expect(response.body).toEqual({
      status: 200,
      message: 'Plan obtenido exitosamente',
      data: plan,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('findById');
    mocks.findById.execute.mockResolvedValue({ id_plan: 7 });

    await request(app.getHttpServer()).get('/planes/7').expect(200);

    expect(mocks.findById.execute).toHaveBeenCalledOnce();
  });

  it('rechaza un id no numérico con 400 (ParseIntPipe) y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .get('/planes/abc')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.findById.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.findById.execute.mockRejectedValue(
      new TestDomainException('Plan inválido', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/planes/999')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Plan inválido',
      data: null,
    });
  });

  it('caso borde: findById devuelve null y la respuesta mantiene data null con 200', async () => {
    mocks.findById.execute.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get('/planes/999')
      .expect(200);

    expect(response.body).toEqual({
      status: 200,
      message: 'Plan obtenido exitosamente',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    mocks.findById.execute.mockResolvedValue({ id_plan: 0 });

    await request(app.getHttpServer()).get('/planes/0').expect(200);

    expect(mocks.findById.execute).toHaveBeenCalledWith(0);
  });
});
