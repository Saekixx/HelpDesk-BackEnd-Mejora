import type { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createPlanMocks,
  createPlanTestApp,
  expectNoGuardsOrRoles,
  TestDomainException,
  type PlanUseCaseMocks,
} from './helpers';

describe('PlanController - POST /planes/create', () => {
  let app: INestApplication;
  let mocks: PlanUseCaseMocks;

  const validBody = {
    numero_plan: 101,
    tipo: 'Empresarial',
    servicio: ['Mantenimiento preventivo', 'Soporte 24/7'],
    precio: 250.5,
    limite_equipos: 15,
  };

  beforeEach(async () => {
    mocks = createPlanMocks();
    app = await createPlanTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con CreatePlanUseCase mockeado', async () => {
    const created = { id_plan: 1, ...validBody, is_active: true };
    mocks.create.execute.mockResolvedValue(created);

    const response = await request(app.getHttpServer())
      .post('/planes/create')
      .send(validBody)
      .expect(201);

    expect(mocks.create.execute).toHaveBeenCalledWith(validBody);
    expect(response.body).toEqual({
      status: 201,
      message: 'Plan creado exitosamente',
      data: created,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('create');
    mocks.create.execute.mockResolvedValue({ id_plan: 1 });

    await request(app.getHttpServer())
      .post('/planes/create')
      .send(validBody)
      .expect(201);

    expect(mocks.create.execute).toHaveBeenCalledOnce();
  });

  it('rechaza DTO inválido y extra con 400 y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .post('/planes/create')
      .send({
        numero_plan: 0,
        tipo: '',
        servicio: ['Soporte', 123],
        precio: -1,
        limite_equipos: 1.5,
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El número de plan debe ser un valor positivo',
    );
    expect(response.body.message).toContain('El tipo de plan es obligatorio');
    expect(response.body.message).toContain(
      'Cada servicio debe ser una cadena de texto',
    );
    expect(response.body.message).toContain('El precio no puede ser negativo');
    expect(response.body.message).toContain(
      'El límite de equipos debe ser un número entero',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.create.execute).not.toHaveBeenCalled();
  });

  it('rechaza precio con más de 2 decimales y servicio que no es arreglo', async () => {
    const response = await request(app.getHttpServer())
      .post('/planes/create')
      .send({ ...validBody, precio: 10.123, servicio: 'Soporte 24/7' })
      .expect(400);

    expect(response.body.message).toContain(
      'El precio debe ser un número válido (máximo 2 decimales)',
    );
    expect(response.body.message).toContain(
      'Los servicios deben enviarse en una lista/arreglo',
    );
    expect(mocks.create.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.create.execute.mockRejectedValue(
      new TestDomainException('El número de plan ya está registrado', 409),
    );

    const response = await request(app.getHttpServer())
      .post('/planes/create')
      .send(validBody)
      .expect(409);

    expect(response.body).toEqual({
      status: 409,
      message: 'El número de plan ya está registrado',
      data: null,
    });
  });

  it('convierte BadRequestException de NestJS en 400 con data null', async () => {
    mocks.create.execute.mockRejectedValue(
      new BadRequestException('No se pudo registrar el plan'),
    );

    const response = await request(app.getHttpServer())
      .post('/planes/create')
      .send(validBody)
      .expect(400);

    expect(response.body).toEqual({
      status: 400,
      message: 'No se pudo registrar el plan',
      data: null,
    });
  });

  it('caso borde: valores numéricos enviados como string se convierten implícitamente', async () => {
    mocks.create.execute.mockResolvedValue({ id_plan: 2 });

    await request(app.getHttpServer())
      .post('/planes/create')
      .send({
        numero_plan: '103',
        tipo: 'Básico',
        servicio: ['Mantenimiento'],
        precio: '0',
        limite_equipos: '5',
      })
      .expect(201);

    expect(mocks.create.execute).toHaveBeenCalledWith({
      numero_plan: 103,
      tipo: 'Básico',
      servicio: ['Mantenimiento'],
      precio: 0,
      limite_equipos: 5,
    });
  });

  it('caso borde: precio=0 y servicio=[] pasan la validación del DTO', async () => {
    mocks.create.execute.mockResolvedValue({ id_plan: 3 });
    const body = { ...validBody, precio: 0, servicio: [] };

    await request(app.getHttpServer())
      .post('/planes/create')
      .send(body)
      .expect(201);

    expect(mocks.create.execute).toHaveBeenCalledWith(body);
  });
});
