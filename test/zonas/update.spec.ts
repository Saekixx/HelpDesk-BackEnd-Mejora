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

describe('ZonasController - PATCH /zona/:id', () => {
  let app: INestApplication;
  let mocks: ZonaUseCaseMocks;

  const validBody = {
    nombre_zona: 'Zona Norte Actualizada',
    descripcion: 'Cubre los edificios A, B, C y D del campus',
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

  it('devuelve 200 y la envoltura { status, message, data } con el id parseado', async () => {
    const updated = { id_zona: 5, ...validBody, is_active: true };
    mocks.updateZona.execute.mockResolvedValue(updated);

    const response = await request(app.getHttpServer())
      .patch('/zona/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateZona.execute).toHaveBeenCalledWith(5, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Zona actualizada correctamente',
      data: updated,
    });
  });

  it('exige solo JwtAuthGuard a nivel de clase y permite cualquier rol', async () => {
    await setup(authenticatedState({ role: RolEnum.CLIENTE_EMPRESA }));
    expectZonaGuard('update');
    mocks.updateZona.execute.mockResolvedValue({ id_zona: 5 });

    await request(app.getHttpServer())
      .patch('/zona/5')
      .send(validBody)
      .expect(200);

    expect(mocks.updateZona.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(authenticatedState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .patch('/zona/5')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.updateZona.execute).not.toHaveBeenCalled();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/zona/abc')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.updateZona.execute).not.toHaveBeenCalled();
  });

  it('rechaza body vacío o parcial porque ambos campos son obligatorios', async () => {
    const empty = await request(app.getHttpServer())
      .patch('/zona/5')
      .send({})
      .expect(400);

    const partial = await request(app.getHttpServer())
      .patch('/zona/5')
      .send({ nombre_zona: 'Solo nombre' })
      .expect(400);

    expect(empty.body.message).toContain(
      'El nombre de la zona es obligatorio',
    );
    expect(empty.body.message).toContain('La descripción es obligatoria');
    expect(partial.body.message).toContain('La descripción es obligatoria');
    expect(mocks.updateZona.execute).not.toHaveBeenCalled();
  });

  it('rechaza longitudes excedidas y extra con 400', async () => {
    const response = await request(app.getHttpServer())
      .patch('/zona/5')
      .send({
        nombre_zona: 'x'.repeat(101),
        descripcion: 'y'.repeat(256),
        extra: 'x',
      })
      .expect(400);

    expect(response.body.message).toContain(
      'El nombre de la zona no puede superar los 100 caracteres',
    );
    expect(response.body.message).toContain(
      'La descripción no puede superar los 255 caracteres',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.updateZona.execute).not.toHaveBeenCalled();
  });

  it('convierte el Error plano del caso de uso (zona no encontrada) en 500', async () => {
    mocks.updateZona.execute.mockRejectedValue(
      new Error('Zona con id 999 no encontrada'),
    );

    const response = await request(app.getHttpServer())
      .patch('/zona/999')
      .send(validBody)
      .expect(500);

    expect(response.body).toEqual({
      status: 500,
      message: 'Zona con id 999 no encontrada',
      data: null,
    });
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    mocks.updateZona.execute.mockRejectedValue(
      new NotFoundException('Zona no disponible'),
    );

    const response = await request(app.getHttpServer())
      .patch('/zona/999')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'Zona no disponible',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.updateZona.execute.mockRejectedValue(
      new TestDomainException('Conflicto al actualizar', 422),
    );

    const response = await request(app.getHttpServer())
      .patch('/zona/5')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Conflicto al actualizar',
      data: null,
    });
  });

  it('caso borde: ParseIntPipe admite id=0 y lo pasa al caso de uso', async () => {
    mocks.updateZona.execute.mockResolvedValue({ id_zona: 0 });

    await request(app.getHttpServer())
      .patch('/zona/0')
      .send(validBody)
      .expect(200);

    expect(mocks.updateZona.execute).toHaveBeenCalledWith(0, validBody);
  });
});
