import {
  ArgumentsHost,
  CallHandler,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NestInterceptor,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { map, Observable } from 'rxjs';
import { expect, type Mock, vi } from 'vitest';

import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { ROLES_KEY } from '@/auth/infrastructure/decorators/roles.decorator';
import { DomainException } from '@/common/domain/domain.exception';
import { CreateZonaUseCase } from '@/zonas/application/create-zona.use-case';
import { GetZonaByIddUseCase } from '@/zonas/application/get-zona-by-id.use-case';
import { GetZonaOptionsUseCase } from '@/zonas/application/get-zona-options.use-case';
import { GetZonasUseCase } from '@/zonas/application/get-zonas.use-case';
import { ToggleZonaStatusUseCase } from '@/zonas/application/toggle-zona-status.use-case';
import { UpdateZonaUseCase } from '@/zonas/application/update-zona.use-case';
import { ZonasController } from '@/zonas/infrastructure/controllers/zonas.controller';

type ZonaMethodName =
  | 'findAll'
  | 'findOptions'
  | 'findOne'
  | 'create'
  | 'update'
  | 'toggleStatus';

export interface ZonaUseCaseMocks {
  getZonas: { execute: Mock };
  getZonaOptions: { execute: Mock };
  getZonaById: { execute: Mock };
  createZona: { execute: Mock };
  updateZona: { execute: Mock };
  toggleZonaStatus: { execute: Mock };
}

/** Estado del usuario simulado por el guard de autenticación del test. */
export interface TestAuthState {
  authenticated: boolean;
  userId: number;
  role?: string;
}

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

export function createZonaMocks(): ZonaUseCaseMocks {
  return {
    getZonas: { execute: vi.fn() },
    getZonaOptions: { execute: vi.fn() },
    getZonaById: { execute: vi.fn() },
    createZona: { execute: vi.fn() },
    updateZona: { execute: vi.fn() },
    toggleZonaStatus: { execute: vi.fn() },
  };
}

export function authenticatedState(
  overrides: Partial<TestAuthState> = {},
): TestAuthState {
  return {
    authenticated: true,
    userId: 42,
    ...overrides,
  };
}

/**
 * Interceptor propio del test: reproduce el sobre { status, message, data }
 * sin importar el ResponseInterceptor real de la aplicación.
 */
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
          return { status, message: body.message, data: body.data ?? null };
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

/** Filtro propio del test: reproduce { status, message, data: null }. */
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

export async function createZonaTestApp(
  mocks: ZonaUseCaseMocks,
  authState: TestAuthState = authenticatedState(),
): Promise<INestApplication> {
  // Guard de test: sustituye a JwtAuthGuard sin Passport, DB ni Redis.
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

  const moduleRef = await Test.createTestingModule({
    controllers: [ZonasController],
    providers: [
      { provide: GetZonasUseCase, useValue: mocks.getZonas },
      { provide: GetZonaOptionsUseCase, useValue: mocks.getZonaOptions },
      { provide: GetZonaByIddUseCase, useValue: mocks.getZonaById },
      { provide: CreateZonaUseCase, useValue: mocks.createZona },
      { provide: UpdateZonaUseCase, useValue: mocks.updateZona },
      { provide: ToggleZonaStatusUseCase, useValue: mocks.toggleZonaStatus },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(jwtGuard)
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

const reflector = new Reflector();

/** Verifica @UseGuards(JwtAuthGuard) a nivel de clase y ausencia de roles. */
export function expectZonaGuard(methodName: ZonaMethodName): void {
  const handler = ZonasController.prototype[methodName];
  const guards = Reflect.getMetadata('__guards__', ZonasController);

  expect(guards).toEqual([JwtAuthGuard]);
  expect(guards).not.toContain(RoleGuard);
  expect(Reflect.getMetadata('__guards__', handler)).toBeUndefined();
  expect(
    reflector.getAllAndOverride(ROLES_KEY, [handler, ZonasController]),
  ).toBeUndefined();
}
