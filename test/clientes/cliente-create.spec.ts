import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { ClienteController } from '@/clientes/infrastructure/controllers/cliente.controller';
import { DocumentoAlreadyInUseException } from '@/clientes/domain/exceptions/cliente.exceptions';
import {
  ADMIN_ONLY,
  adminAuthState,
  createClientesMocks,
  createClientesTestApp,
  expectClientesGuards,
  TestDomainException,
  type ClientesUseCaseMocks,
} from './helpers';

describe('ClienteController - POST /clientes', () => {
  let app: INestApplication;
  let mocks: ClientesUseCaseMocks;

  const validBody = {
    datos_empresa: {
      tipo_cliente: 'JURIDICA',
      numero_documento: '20123456789',
      nombre_principal: 'Acme Corp SAC',
      direccion: 'Av. Siempre Viva 123',
      rubro: 'Retail',
      id_plan: 1,
    },
    responsable: {
      nombre: 'Carlos',
      apellido: 'Mendoza',
      cargo: 'Gerente de TI',
      telefono: '987654321',
      correo: 'carlos.mendoza@acme.com',
    },
    sucursal_principal: {
      nombre_sucursal: 'Sede Central',
      encargado: 'Juan Pérez',
      direccion: 'Jr. Los Pinos 456',
      is_principal: true,
    },
  };

  async function setup(state = adminAuthState()): Promise<INestApplication> {
    mocks = createClientesMocks();
    app = await createClientesTestApp(mocks, state);
    return app;
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('devuelve 201 y la envoltura { status, message, data } con el body anidado validado', async () => {
    await setup();
    const data = { id_cliente: 1, correo_responsable: validBody.responsable.correo };
    mocks.createCliente.execute.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/clientes')
      .send(validBody)
      .expect(201);

    expect(mocks.createCliente.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        datos_empresa: expect.objectContaining({
          tipo_cliente: 'JURIDICA',
          numero_documento: '20123456789',
        }),
        responsable: expect.objectContaining({
          correo: 'carlos.mendoza@acme.com',
        }),
        sucursal_principal: expect.objectContaining({
          nombre_sucursal: 'Sede Central',
        }),
      }),
    );
    expect(response.body).toEqual({
      status: 201,
      message: 'Empresa y cuenta principal registradas correctamente',
      data,
    });
  });

  it('exige JwtAuthGuard + RoleGuard a nivel de clase y @Roles(ADMINISTRADOR)', async () => {
    await setup();
    expectClientesGuards(ClienteController, 'create', ADMIN_ONLY);
    mocks.createCliente.execute.mockResolvedValue({ id_cliente: 1 });

    await request(app.getHttpServer()).post('/clientes').send(validBody).expect(201);

    expect(mocks.createCliente.execute).toHaveBeenCalledOnce();
  });

  it('devuelve 401 sin autenticación y no llama al caso de uso', async () => {
    await setup(adminAuthState({ authenticated: false }));

    const response = await request(app.getHttpServer())
      .post('/clientes')
      .send(validBody)
      .expect(401);

    expect(response.body.status).toBe(401);
    expect(response.body.data).toBeNull();
    expect(mocks.createCliente.execute).not.toHaveBeenCalled();
  });

  it('devuelve 403 para roles de soporte (solo ADMINISTRADOR puede crear)', async () => {
    await setup(adminAuthState({ role: RolEnum.SOPORTE_TECNICO }));

    const response = await request(app.getHttpServer())
      .post('/clientes')
      .send(validBody)
      .expect(403);

    expect(response.body.status).toBe(403);
    expect(response.body.data).toBeNull();
    expect(mocks.createCliente.execute).not.toHaveBeenCalled();
  });

  it('rechaza DTO anidado inválido y extra con 400 (whitelist/forbidNonWhitelisted)', async () => {
    await setup();

    const response = await request(app.getHttpServer())
      .post('/clientes')
      .send({
        datos_empresa: {
          numero_documento: '20123456789',
          nombre_principal: 'Acme',
          id_plan: 1,
        },
        responsable: {
          nombre: 'Carlos',
          apellido: 'Mendoza',
          telefono: '987654321',
          correo: 'no-es-email',
        },
        sucursal_principal: { nombre_sucursal: 'Sede Central' },
        extra: 'x',
      })
      .expect(400);

    expect(response.body.status).toBe(400);
    expect(response.body.data).toBeNull();
    expect(response.body.message).toContain('El tipo de cliente es obligatorio');
    expect(response.body.message).toContain('El correo electrónico debe ser válido');
    expect(response.body.message).toContain('property extra should not exist');
    expect(mocks.createCliente.execute).not.toHaveBeenCalled();
  });

  it('convierte DomainException DocumentoAlreadyInUseException en 409', async () => {
    await setup();
    mocks.createCliente.execute.mockRejectedValue(
      new DocumentoAlreadyInUseException(),
    );

    const response = await request(app.getHttpServer())
      .post('/clientes')
      .send(validBody)
      .expect(409);

    expect(response.body).toEqual({
      status: 409,
      message: 'El número de documento ya está registrado',
      data: null,
    });
  });

  it('convierte otra DomainException respetando su statusCode', async () => {
    await setup();
    mocks.createCliente.execute.mockRejectedValue(
      new TestDomainException('Conflicto de negocio', 422),
    );

    const response = await request(app.getHttpServer())
      .post('/clientes')
      .send(validBody)
      .expect(422);

    expect(response.body).toEqual({
      status: 422,
      message: 'Conflicto de negocio',
      data: null,
    });
  });

  it('caso borde: campos opcionales anidados omitidos siguen siendo válidos', async () => {
    await setup();
    mocks.createCliente.execute.mockResolvedValue({ id_cliente: 2 });

    await request(app.getHttpServer())
      .post('/clientes')
      .send({
        datos_empresa: {
          tipo_cliente: 'NATURAL',
          numero_documento: '12345678',
          nombre_principal: 'Persona Natural',
          id_plan: 1,
        },
        responsable: {
          nombre: 'Ana',
          apellido: 'López',
          telefono: '987654322',
          correo: 'ana@example.com',
        },
        sucursal_principal: { nombre_sucursal: 'Única' },
      })
      .expect(201);

    expect(mocks.createCliente.execute).toHaveBeenCalledOnce();
  });
});
