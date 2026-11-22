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

describe('PlanController - PATCH /planes/:id', () => {
  let app: INestApplication;
  let mocks: PlanUseCaseMocks;

  const validBody = {
    tipo: 'Empresarial Premium',
    precio: 299.9,
    limite_equipos: 20,
  };

  beforeEach(async () => {
    mocks = createPlanMocks();
    app = await createPlanTestApp(mocks);
  });

  afterEach(async () => {
    await app.close();
  });

  it('devuelve 200 y la envoltura { status, message, data } con el id parseado', async () => {
    const updated = { id_plan: 5, ...validBody };
    mocks.update.execute.mockResolvedValue(updated);

    const response = await request(app.getHttpServer())
      .patch('/planes/5')
      .send(validBody)
      .expect(200);

    expect(mocks.update.execute).toHaveBeenCalledWith(5, validBody);
    expect(response.body).toEqual({
      status: 200,
      message: 'Plan actualizado exitosamente',
      data: updated,
    });
  });

  it('es público: sin JwtAuthGuard, sin RoleGuard ni @Roles, y sin cabecera Authorization', async () => {
    expectNoGuardsOrRoles('update');
    mocks.update.execute.mockResolvedValue({ id_plan: 5 });

    await request(app.getHttpServer())
      .patch('/planes/5')
      .send(validBody)
      .expect(200);

    expect(mocks.update.execute).toHaveBeenCalledOnce();
  });

  it('rechaza id no numérico con 400 (ParseIntPipe) y no llama al caso de uso', async () => {
    const response = await request(app.getHttpServer())
      .patch('/planes/abc')
      .send(validBody)
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('numeric string is expected');
    expect(mocks.update.execute).not.toHaveBeenCalled();
  });

  it('rechaza campos inválidos y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    const response = await request(app.getHttpServer())
      .patch('/planes/5')
      .send({
        numero_plan: -2,
        servicio: ['Soporte', {}],
        precio: -0.01,
        limite_equipos: 0,
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain(
      'El número de plan debe ser un valor positivo',
    );
    expect(response.body.message).toContain(
      'Cada servicio debe ser una cadena de texto',
    );
    expect(response.body.message).toContain('El precio no puede ser negativo');
    expect(response.body.message).toContain(
      'El límite de equipos debe ser de al menos 1',
    );
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.update.execute).not.toHaveBeenCalled();
  });

  it('convierte NotFoundException de NestJS en 404 con data null', async () => {
    mocks.update.execute.mockRejectedValue(
      new NotFoundException('El plan con ID 999 no existe'),
    );

    const response = await request(app.getHttpServer())
      .patch('/planes/999')
      .send(validBody)
      .expect(404);

    expect(response.body).toEqual({
      status: 404,
      message: 'El plan con ID 999 no existe',
      data: null,
    });
  });

  it('convierte DomainException del caso de uso respetando su statusCode', async () => {
    mocks.update.execute.mockRejectedValue(
      new TestDomainException('Conflicto al actualizar el plan', 422),
    );

    const response = await request(app.getHttpServer())
      .patch('/planes/5')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Conflicto al actualizar el plan',
      data: null,
    });
  });

  it('caso borde: PATCH con body vacío es válido y se reenvía {}', async () => {
    mocks.update.execute.mockResolvedValue({ id_plan: 5 });

    await request(app.getHttpServer()).patch('/planes/5').send({}).expect(200);

    expect(mocks.update.execute).toHaveBeenCalledWith(5, {});
  });

  it('caso borde: actualizar solo un campo opcional se reenvía sin alterar', async () => {
    mocks.update.execute.mockResolvedValue({ id_plan: 5 });

    await request(app.getHttpServer())
      .patch('/planes/5')
      .send({ tipo: 'Solo el tipo cambia' })
      .expect(200);

    expect(mocks.update.execute).toHaveBeenCalledWith(5, {
      tipo: 'Solo el tipo cambia',
    });
  });
});
