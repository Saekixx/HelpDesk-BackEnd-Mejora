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

describe('PlanController - GET /planes/options', () => {
  let app: INestApplication;
  let mocks: PlanUseCaseMocks;

  beforeEach(async () => {
    mocks = createPlanMocks();
    app = await createPlanTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con GetPlanOptionsUseCase mockeado', async () => {
    const options = [
      { id: 1, nombre: 'Básico' },
      { id: 2, nombre: 'Empresarial' },
    ];
    mocks.getPlanOptions.execute.mockResolvedValue(options);

    const response = await request(app.getHttpServer())
      .get('/planes/options')
      .expect(200);

    expect(mocks.getPlanOptions.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Opciones de planes obtenidas exitosamente',
      data: options,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('getPlanOptions');
    mocks.getPlanOptions.execute.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/planes/options').expect(200);

    expect(mocks.getPlanOptions.execute).toHaveBeenCalledOnce();
  });

  it('convierte DomainException del caso de uso en 500 con data null', async () => {
    mocks.getPlanOptions.execute.mockRejectedValue(
      new TestDomainException('Error al listar opciones', 500),
    );

    const response = await request(app.getHttpServer())
      .get('/planes/options')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Error al listar opciones',
      data: null,
    });
  });

  it('caso borde: lista vacía de opciones se devuelve sin error', async () => {
    mocks.getPlanOptions.execute.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/planes/options')
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('caso borde: la ruta options no se interpreta como id numérico', async () => {
    mocks.getPlanOptions.execute.mockResolvedValue([{ id: 3, nombre: 'Pro' }]);

    const response = await request(app.getHttpServer())
      .get('/planes/options')
      .expect(200);

    expect(mocks.findById.execute).not.toHaveBeenCalled();
    expect(mocks.getPlanOptions.execute).toHaveBeenCalledOnce();
    expect(response.body.data).toEqual([{ id: 3, nombre: 'Pro' }]);
  });
});
