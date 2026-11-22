import type { INestApplication } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
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

describe('ZonasController - GET /zona/:id', () => {
  let app: INestApplication;
  let mocks: ZonaUseCaseMocks;

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

  it('devuelve 200 y la envoltura { status, message, data } con el id parseado', async () => {
    const zona = {
      id_zona: 7,
      nombre_zona: 'Zona Norte',
      descripcion: 'Cubre el edificio A',
      is_active: true,
    };
    mocks.getZonaById.execute.mockResolvedValue(zona);

    const response = await request(app.getHttpServer())
      .get('/zona/7')
      .expect(200);

    expect(mocks.getZonaById.execute).toHaveBeenCalledWith(7);
    expect(response.body).toEqual({
      status: 200,
      message: 'Zona encontrada correctamente',
      data: zona,
    });
  });

  it('exige solo JwtAuthGuard a nivel de clase y permite cualquier rol', async () => {
    await setup(authenticatedState({ role: RolEnum.SOPORTE_INSITU }));
    expectZonaGuard('findOne');
    mocks.getZonaById.execute.mockResolvedValue({ id_zona: 7 });

    await request(app.getHttpServer()).get('/zona/7').expect(200);

    expect(mocks.getZonaById.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(authenticatedState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/zona/7')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getZonaById.execute).not.toHaveBeenCalled();
  });

  it('rechaza un id no numérico con 400 (ParseIntPipe)', async () => {
    const response = await request(app.getHttpServer())
      .get('/zona/abc')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.getZonaById.execute).not.toHaveBeenCalled();
  });

  it('convierte el Error plano del caso de uso (zona no encontrada) en 500', async () => {
    mocks.getZonaById.execute.mockRejectedValue(
      new Error('Zona con id 999 no encontrada'),
    );

    const response = await request(app.getHttpServer())
      .get('/zona/999')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Zona con id 999 no encontrada',
      data: null,
    });
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    mocks.getZonaById.execute.mockRejectedValue(
      new NotFoundException('Zona no disponible'),
    );

    const response = await request(app.getHttpServer())
      .get('/zona/999')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Zona no disponible',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.getZonaById.execute.mockRejectedValue(
      new TestDomainException('Zona inválida', 422),
    );

    const response = await request(app.getHttpServer())
      .get('/zona/5')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Zona inválida',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    mocks.getZonaById.execute.mockResolvedValue({ id_zona: 0 });

    await request(app.getHttpServer()).get('/zona/0').expect(200);

    expect(mocks.getZonaById.execute).toHaveBeenCalledWith(0);
  });

  it('caso borde: un mock que devuelve null responde 200 con data null', async () => {
    mocks.getZonaById.execute.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get('/zona/999')
      .expect(200);

    expect(response.body).toEqual({
      status: 200,
      message: 'Zona encontrada correctamente',
      data: null,
    });
  });
});
