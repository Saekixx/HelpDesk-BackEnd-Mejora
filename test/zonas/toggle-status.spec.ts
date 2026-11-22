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

describe('ZonasController - PATCH /zona/:id/toggle-status', () => {
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

  it('devuelve 200 y la envoltura { status, message, data } con el mensaje del caso de uso', async () => {
    const message = 'Zona inactivo correctamente';
    mocks.toggleZonaStatus.execute.mockResolvedValue(message);

    const response = await request(app.getHttpServer())
      .patch('/zona/5/toggle-status')
      .expect(200);

    expect(mocks.toggleZonaStatus.execute).toHaveBeenCalledWith(5);
    expect(response.body).toEqual({
      status: 200,
      message,
      data: null,
    });
  });

  it('exige solo JwtAuthGuard a nivel de clase y permite cualquier rol', async () => {
    await setup(authenticatedState({ role: RolEnum.SOPORTE_TECNICO }));
    expectZonaGuard('toggleStatus');
    mocks.toggleZonaStatus.execute.mockResolvedValue(
      'Zona activo correctamente',
    );

    await request(app.getHttpServer())
      .patch('/zona/5/toggle-status')
      .expect(200);

    expect(mocks.toggleZonaStatus.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(authenticatedState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/zona/5/toggle-status')
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.toggleZonaStatus.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/zona/abc/toggle-status')
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.toggleZonaStatus.execute).not.toHaveBeenCalled();
  });

  it('convierte el Error plano del caso de uso (zona no encontrada) en 500', async () => {
    mocks.toggleZonaStatus.execute.mockRejectedValue(
      new Error('Zona con id 999 no encontrada'),
    );

    const response = await request(app.getHttpServer())
      .patch('/zona/999/toggle-status')
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Zona con id 999 no encontrada',
      data: null,
    });
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    mocks.toggleZonaStatus.execute.mockRejectedValue(
      new NotFoundException('Zona no disponible'),
    );

    const response = await request(app.getHttpServer())
      .patch('/zona/999/toggle-status')
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Zona no disponible',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.toggleZonaStatus.execute.mockRejectedValue(
      new TestDomainException('No se pudo cambiar el estado', 422),
    );

    const response = await request(app.getHttpServer())
      .patch('/zona/5/toggle-status')
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'No se pudo cambiar el estado',
      data: null,
    });
  });

  it('caso borde: mensaje de activación se reenvía sin alterar', async () => {
    const message = 'Zona activo correctamente';
    mocks.toggleZonaStatus.execute.mockResolvedValue(message);

    const response = await request(app.getHttpServer())
      .patch('/zona/8/toggle-status')
      .expect(200);

    expect(response.body.message).toBe(message);
    expect(response.body.data).toBeNull();
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    mocks.toggleZonaStatus.execute.mockResolvedValue(
      'Zona activo correctamente',
    );

    await request(app.getHttpServer())
      .patch('/zona/0/toggle-status')
      .expect(200);

    expect(mocks.toggleZonaStatus.execute).toHaveBeenCalledWith(0);
  });
});
