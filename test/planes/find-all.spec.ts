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

describe('PlanController - GET /planes', () => {
  let app: INestApplication;
  let mocks: PlanUseCaseMocks;

  beforeEach(async () => {
    mocks = createPlanMocks();
    app = await createPlanTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con FindAllPlanesUseCase mockeado', async () => {
    const planes = [
      {
        id: 1,
        numero_plan: 101,
        tipo: 'Empresarial',
        servicio: ['Soporte 24/7'],
        precio: 250.5,
        limite_equipos: 15,
        is_active: true,
      },
      {
        id: 2,
        numero_plan: 102,
        tipo: 'Básico',
        servicio: ['Mantenimiento'],
        precio: 100,
        limite_equipos: 5,
        is_active: false,
      },
    ];
    mocks.findAll.execute.mockResolvedValue(planes);

    const response = await request(app.getHttpServer())
      .get('/planes')
      .expect(200);

    expect(mocks.findAll.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Planes obtenidos exitosamente',
      data: planes,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('findAll');
    mocks.findAll.execute.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/planes').expect(200);

    expect(mocks.findAll.execute).toHaveBeenCalledOnce();
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.findAll.execute.mockRejectedValue(
      new TestDomainException('No se pudieron listar los planes', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/planes')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No se pudieron listar los planes',
      data: null,
    });
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    mocks.findAll.execute.mockRejectedValue(
      new NotFoundException('Catálogo de planes no disponible'),
    );

    const response = await request(app.getHttpServer())
      .get('/planes')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Catálogo de planes no disponible',
      data: null,
    });
  });

  it('caso borde: lista vacía se devuelve con data [] sin error', async () => {
    mocks.findAll.execute.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/planes')
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('caso borde: un error plano se convierte en 500 con data null', async () => {
    mocks.findAll.execute.mockRejectedValue(new Error('Fallo inesperado'));

    const response = await request(app.getHttpServer())
      .get('/planes')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Fallo inesperado',
      data: null,
    });
  });
});
