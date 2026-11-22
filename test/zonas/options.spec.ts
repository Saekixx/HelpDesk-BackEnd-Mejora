import type { INestApplication } from '@nestjs/common';
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

describe('ZonasController - GET /zona/options', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con GetZonaOptionsUseCase mockeado', async () => {
    const options = [
      { id_zona: 1, nombre_zona: 'Zona Norte' },
      { id_zona: 2, nombre_zona: 'Zona Sur' },
    ];
    mocks.getZonaOptions.execute.mockResolvedValue(options);

    const response = await request(app.getHttpServer())
      .get('/zona/options')
      .expect(200);

    expect(mocks.getZonaOptions.execute).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      status: 200,
      message: 'Opciones de zonas encontradas correctamente',
      data: options,
    });
  });

  it('exige solo JwtAuthGuard a nivel de clase y permite cualquier rol', async () => {
    await setup(authenticatedState({ role: RolEnum.CLIENTE_TRABAJADOR }));
    expectZonaGuard('findOptions');
    mocks.getZonaOptions.execute.mockResolvedValue([]);

    await request(app.getHttpServer()).get('/zona/options').expect(200);

    expect(mocks.getZonaOptions.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(authenticatedState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .get('/zona/options')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.getZonaOptions.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException del caso de uso en 500 con data null', async () => {
    mocks.getZonaOptions.execute.mockRejectedValue(
      new TestDomainException('Error al listar opciones', 500),
    );

    const response = await request(app.getHttpServer())
      .get('/zona/options')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Error al listar opciones',
      data: null,
    });
  });

  it('convierte un Error plano en 500 con su mensaje y data null', async () => {
    mocks.getZonaOptions.execute.mockRejectedValue(
      new Error('Fallo inesperado'),
    );

    const response = await request(app.getHttpServer())
      .get('/zona/options')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Fallo inesperado',
      data: null,
    });
  });

  it('caso borde: lista vacía de opciones se devuelve sin error', async () => {
    mocks.getZonaOptions.execute.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/zona/options')
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('caso borde: la ruta options no se interpreta como id numérico', async () => {
    mocks.getZonaOptions.execute.mockResolvedValue([
      { id_zona: 3, nombre_zona: 'Zona Este' },
    ]);

    await request(app.getHttpServer()).get('/zona/options').expect(200);

    expect(mocks.getZonaById.execute).not.toHaveBeenCalled();
    expect(mocks.getZonaOptions.execute).toHaveBeenCalledOnce();
  });
});
