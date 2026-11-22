import {
  ArgumentsHost,
  CallHandler,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NestInterceptor,
  UnauthorizedException,
  ValidationPipe,
  type Type,
} from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { map, Observable } from 'rxjs';
import { expect, type Mock, vi } from 'vitest';

import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { ROLES_KEY } from '@/auth/infrastructure/decorators/roles.decorator';
import { DomainException } from '@/common/domain/domain.exception';
import { AreaController } from '@/clientes/infrastructure/controllers/area.controller';
import { ClienteController } from '@/clientes/infrastructure/controllers/cliente.controller';
import { SucursalController } from '@/clientes/infrastructure/controllers/sucursal.controller';
import { CreateAreaUseCase } from '@/clientes/application/use-cases/area/create-area.use-case';
import { GetAreasOptionsUseCase } from '@/clientes/application/use-cases/area/get-areas-options.use-case';
import { GetAreasUseCase } from '@/clientes/application/use-cases/area/get-areas.use-case';
import { GetAreaByIdUseCase } from '@/clientes/application/use-cases/area/get-area-by-id.use-case';
import { ToggleAreaStatusUseCase } from '@/clientes/application/use-cases/area/toggle-area-status.use-case';
import { UpdateAreaUseCase } from '@/clientes/application/use-cases/area/update-area.use-case';
import { CreateClienteUseCase } from '@/clientes/application/use-cases/cliente/create-cliente.use-case';
import { GetClienteByIdUseCase } from '@/clientes/application/use-cases/cliente/get-cliente-by-id.use-case';
import { GetClientesOptionsUseCase } from '@/clientes/application/use-cases/cliente/get-clientes-options.use-case';
import { GetClienteStatsUseCase } from '@/clientes/application/use-cases/cliente/get-cliente-stats.use-case';
import { GetClientesUseCase } from '@/clientes/application/use-cases/cliente/get-clientes.use-case';
import { ToggleClienteStatusUseCase } from '@/clientes/application/use-cases/cliente/toggle-cliente-status.use-case';
import { UpdateClienteUseCase } from '@/clientes/application/use-cases/cliente/update-cliente.use-case';
import { CreateSucursalUseCase } from '@/clientes/application/use-cases/sucursal/create-sucursal.use-case';
import { GetSucursalByIdUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursal-by-id.use-case';
import { GetSucursalesOptionsUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursales-options.use-case';
import { GetSucursalStatsUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursal-stats.use-case';
import { GetSucursalesUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursales.use-case';
import { ToggleSucursalStatusUseCase } from '@/clientes/application/use-cases/sucursal/toggle-sucursal-status.use-case';
import { UpdateSucursalUseCase } from '@/clientes/application/use-cases/sucursal/update-sucursal.use-case';

const GUARDS_METADATA = '__guards__';

export const CLIENTES_READ_ROLES = [
  RolEnum.ADMINISTRADOR,
  RolEnum.SOPORTE_INSITU,
  RolEnum.SOPORTE_TECNICO,
];
export const ADMIN_ONLY = [RolEnum.ADMINISTRADOR];

export interface ClientesUseCaseMocks {
  getClientesOptions: { execute: Mock };
  getClientes: { execute: Mock };
  getClienteById: { execute: Mock };
  createCliente: { execute: Mock };
  updateCliente: { execute: Mock };
  toggleClienteStatus: { execute: Mock };
  getClienteStats: { execute: Mock };
  getSucursalesOptions: { execute: Mock };
  getSucursales: { execute: Mock };
  getSucursalById: { execute: Mock };
  getSucursalStats: { execute: Mock };
  createSucursal: { execute: Mock };
  updateSucursal: { execute: Mock };
  toggleSucursalStatus: { execute: Mock };
  getAreasOptions: { execute: Mock };
  getAreas: { execute: Mock };
  getAreaById: { execute: Mock };
  createArea: { execute: Mock };
  updateArea: { execute: Mock };
  toggleAreaStatus: { execute: Mock };
}

/** Estado del usuario simulado por el guard de autenticación del test. */
export interface TestAuthState {
  authenticated: boolean;
  userId: number;
  role?: string;
}

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

export function createClientesMocks(): ClientesUseCaseMocks {
  return {
    getClientesOptions: { execute: vi.fn() },
    getClientes: { execute: vi.fn() },
    getClienteById: { execute: vi.fn() },
    createCliente: { execute: vi.fn() },
    updateCliente: { execute: vi.fn() },
    toggleClienteStatus: { execute: vi.fn() },
    getClienteStats: { execute: vi.fn() },
    getSucursalesOptions: { execute: vi.fn() },
    getSucursales: { execute: vi.fn() },
    getSucursalById: { execute: vi.fn() },
    getSucursalStats: { execute: vi.fn() },
    createSucursal: { execute: vi.fn() },
    updateSucursal: { execute: vi.fn() },
    toggleSucursalStatus: { execute: vi.fn() },
    getAreasOptions: { execute: vi.fn() },
    getAreas: { execute: vi.fn() },
    getAreaById: { execute: vi.fn() },
    createArea: { execute: vi.fn() },
    updateArea: { execute: vi.fn() },
    toggleAreaStatus: { execute: vi.fn() },
  };
}

export function adminAuthState(
  overrides: Partial<TestAuthState> = {},
): TestAuthState {
  return {
    authenticated: true,
    userId: 99,
    role: RolEnum.ADMINISTRADOR,
    ...overrides,
  };
}

/** Interceptor propio del test para el sobre { status, message, data }. */
class TestResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const status: number = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((result: unknown) => {
        if (typeof result === 'string') {
          return { status, message: result, data: null };
        }
        if (
          result !== null &&
          typeof result === 'object' &&
          'message' in result &&
          'data' in result
        ) {
          const body = result as { message: string; data: unknown };
          return { status, message: body.message, data: body.data };
        }
        return {
          status,
          message: 'Operación realizada con éxito',
          data: result ?? null,
        };
      }),
    );
  }
}

/** Filtro propio del test para { status, message, data: null }. */
@Catch()
class TestExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status: (code: number) => { json: (body: unknown) => void };
    }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof DomainException) {
      status = exception.statusCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const value = (body as { message: unknown }).message;
        message = Array.isArray(value) ? value.join(', ') : String(value);
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({ status, message, data: null });
  }
}

const reflector = new Reflector();

export async function createClientesTestApp(
  mocks: ClientesUseCaseMocks,
  authState: TestAuthState = adminAuthState(),
): Promise<INestApplication> {
  // Guards de test: sustituyen a JwtAuthGuard/RoleGuard sin Passport, DB ni Redis.
  const jwtGuard = {
    canActivate(context: ExecutionContext): boolean {
      if (!authState.authenticated) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      const request = context
        .switchToHttp()
        .getRequest<{ user?: Record<string, unknown> }>();
      request.user = {
        sub: authState.userId,
        userId: authState.userId,
        role: authState.role,
        nombre: 'Usuario de prueba',
      };
      return true;
    },
  };

  const roleGuard = {
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!requiredRoles) return true;

      const request = context
        .switchToHttp()
        .getRequest<{ user?: { role?: string } }>();
      if (!request.user?.role || !requiredRoles.includes(request.user.role)) {
        throw new ForbiddenException(
          'No tienes permisos para acceder a este recurso',
        );
      }
      return true;
    },
  };

  const moduleRef = await Test.createTestingModule({
    controllers: [ClienteController, SucursalController, AreaController],
    providers: [
      { provide: GetClientesOptionsUseCase, useValue: mocks.getClientesOptions },
      { provide: GetClientesUseCase, useValue: mocks.getClientes },
      { provide: GetClienteByIdUseCase, useValue: mocks.getClienteById },
      { provide: CreateClienteUseCase, useValue: mocks.createCliente },
      { provide: UpdateClienteUseCase, useValue: mocks.updateCliente },
      {
        provide: ToggleClienteStatusUseCase,
        useValue: mocks.toggleClienteStatus,
      },
      { provide: GetClienteStatsUseCase, useValue: mocks.getClienteStats },
      {
        provide: GetSucursalesOptionsUseCase,
        useValue: mocks.getSucursalesOptions,
      },
      { provide: GetSucursalesUseCase, useValue: mocks.getSucursales },
      { provide: GetSucursalByIdUseCase, useValue: mocks.getSucursalById },
      { provide: GetSucursalStatsUseCase, useValue: mocks.getSucursalStats },
      { provide: CreateSucursalUseCase, useValue: mocks.createSucursal },
      { provide: UpdateSucursalUseCase, useValue: mocks.updateSucursal },
      {
        provide: ToggleSucursalStatusUseCase,
        useValue: mocks.toggleSucursalStatus,
      },
      { provide: GetAreasOptionsUseCase, useValue: mocks.getAreasOptions },
      { provide: GetAreasUseCase, useValue: mocks.getAreas },
      { provide: GetAreaByIdUseCase, useValue: mocks.getAreaById },
      { provide: CreateAreaUseCase, useValue: mocks.createArea },
      { provide: UpdateAreaUseCase, useValue: mocks.updateArea },
      { provide: ToggleAreaStatusUseCase, useValue: mocks.toggleAreaStatus },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(jwtGuard)
    .overrideGuard(RoleGuard)
    .useValue(roleGuard)
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new TestResponseInterceptor());
  app.useGlobalFilters(new TestExceptionFilter());
  await app.init();

  return app;
}

/** Verifica @UseGuards a nivel de clase y @Roles a nivel de método. */
export function expectClientesGuards(
  controller: Type<unknown>,
  methodName: string,
  roles: RolEnum[],
): void {
  const handler = (controller.prototype as Record<string, Type<unknown>>)[
    methodName
  ];

  expect(Reflect.getMetadata(GUARDS_METADATA, controller)).toEqual([
    JwtAuthGuard,
    RoleGuard,
  ]);
  expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toBeUndefined();
  expect(
    reflector.getAllAndOverride(ROLES_KEY, [handler, controller]),
  ).toEqual(roles);
}
