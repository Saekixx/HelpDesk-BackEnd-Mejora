import type { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  authenticatedState,
  createZonaMocks,
  createZonaTestApp,
  expectZonaGuard,
  TestDomainException,
  type TestAuthState,
  type ZonaUseCaseMocks,
} from './helpers';

describe('ZonasController - POST /zona', () => {
  let app: INestApplication;
  let mocks: ZonaUseCaseMocks;

  const validBody = {
    nombre_zona: 'Zona Norte - Sede Central',
    descripcion: 'Cubre los edificios A, B y C del campus',
  };

  async function setup(state: TestAuthState = authenticatedState()) {
    mocks = createZonaMocks();
    app = await createZonaTestApp(mocks, state);
  }

  beforeEach(async () => {
    await setup();
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con CreateZonaUseCase mockeado', async () => {
    const created = { id_zona: 1, ...validBody, is_active: true };
    mocks.createZona.execute.mockResolvedValue(created);

    const response = await request(app.getHttpServer())
      .post('/zona')
      .send(validBody)
      .expect(201);

    expect(mocks.createZona.execute).toHaveBeenCalledWith(validBody);
    expect(response.body).toEqual({
      status: 201,
      message: 'Zona creada correctamente',
      data: created,
    });
  });

  it('exige solo JwtAuthGuard a nivel de clase y permite cualquier rol', async () => {
    await setup(authenticatedState({ role: RolEnum.CLIENTE_SUCURSAL }));
    expectZonaGuard('create');
    mocks.createZona.execute.mockResolvedValue({ id_zona: 1 });

    await request(app.getHttpServer()).post('/zona').send(validBody).expect(201);

    expect(mocks.createZona.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(authenticatedState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .post('/zona')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.createZona.execute).not.toHaveBeenCalled();
  });

  it('rechaza campos obligatorios ausentes y extra con 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/zona')
      .send({ extra: 'x' })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El nombre de la zona es obligatorio',
    );
    expect(response.body.message).toContain('La descripción es obligatoria');
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.createZona.execute).not.toHaveBeenCalled();
  });

  it('rechaza campos vacíos y que exceden la longitud máxima con 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/zona')
      .send({ nombre_zona: 'x'.repeat(101), descripcion: 'y'.repeat(256) })
      .expect(400);

    expect(response.body.message).toContain(
      'El nombre de la zona no puede superar los 100 caracteres',
    );
    expect(response.body.message).toContain(
      'La descripción no puede superar los 255 caracteres',
    );
    expect(mocks.createZona.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.createZona.execute.mockRejectedValue(
      new TestDomainException('La zona ya existe', 409),
    );

    const response = await request(app.getHttpServer())
      .post('/zona')
      .send(validBody)
      .expect(409);

    expect(response.body).toEqual({
      status: 409,
      message: 'La zona ya existe',
      data: null,
    });
  });

  it('convierte BadRequestException de NestJS en 400 con data null', async () => {
    mocks.createZona.execute.mockRejectedValue(
      new BadRequestException('No se pudo registrar la zona'),
    );

    const response = await request(app.getHttpServer())
      .post('/zona')
      .send(validBody)
      .expect(400);

    expect(response.body).toEqual({
      status: 400,
      message: 'No se pudo registrar la zona',
      data: null,
    });
  });

  it('caso borde: longitudes exactas de 100 y 255 caracteres son válidas', async () => {
    mocks.createZona.execute.mockResolvedValue({ id_zona: 2 });
    const body = {
      nombre_zona: 'n'.repeat(100),
      descripcion: 'd'.repeat(255),
    };

    await request(app.getHttpServer()).post('/zona').send(body).expect(201);

    expect(mocks.createZona.execute).toHaveBeenCalledWith(body);
  });
});
