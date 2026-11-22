import {
  ArgumentsHost,
  CallHandler,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NestInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { map, Observable } from 'rxjs';
import { expect, type Mock, vi } from 'vitest';

import { CreatePlanUseCase } from '@/planes/application/use-cases/create-plan.usecase';
import { FindAllPlanesUseCase } from '@/planes/application/use-cases/find-all-planes.usecase';
import { FindByIdPlanesUseCase } from '@/planes/application/use-cases/find-by-id-plan.usecase';
import { GetPlanOptionsUseCase } from '@/planes/application/use-cases/get-plan-options.usacase';
import { TogglePlanStatusUseCase } from '@/planes/application/use-cases/toggle-plan-status.use-case';
import { UpdatePlanUseCase } from '@/planes/application/use-cases/update-plan.usecase';
import { PlanController } from '@/planes/infrastructure/controllers/plan.controller';
import { ROLES_KEY } from '@/auth/infrastructure/decorators/roles.decorator';
import { DomainException } from '@/common/domain/domain.exception';

type PlanMethodName =
  | 'findAll'
  | 'getPlanOptions'
  | 'findById'
  | 'create'
  | 'update'
  | 'toggleStatus';

export interface PlanUseCaseMocks {
  findAll: { execute: Mock };
  getPlanOptions: { execute: Mock };
  findById: { execute: Mock };
  create: { execute: Mock };
  update: { execute: Mock };
  toggleStatus: { execute: Mock };
}

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

export function createPlanMocks(): PlanUseCaseMocks {
  return {
    findAll: { execute: vi.fn() },
    getPlanOptions: { execute: vi.fn() },
    findById: { execute: vi.fn() },
    create: { execute: vi.fn() },
    update: { execute: vi.fn() },
    toggleStatus: { execute: vi.fn() },
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
          return {
            status,
            message: body.message,
            data: body.data ?? null,
          };
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

export async function createPlanTestApp(
  mocks: PlanUseCaseMocks,
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [PlanController],
    providers: [
      { provide: FindAllPlanesUseCase, useValue: mocks.findAll },
      { provide: GetPlanOptionsUseCase, useValue: mocks.getPlanOptions },
      { provide: FindByIdPlanesUseCase, useValue: mocks.findById },
      { provide: CreatePlanUseCase, useValue: mocks.create },
      { provide: UpdatePlanUseCase, useValue: mocks.update },
      { provide: TogglePlanStatusUseCase, useValue: mocks.toggleStatus },
    ],
  }).compile();

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

/**
 * PlanController no declara guards ni roles; verifica esa ausencia de metadata
 * en la clase y en el handler para los 6 endpoints públicos.
 */
export function expectNoGuardsOrRoles(methodName: PlanMethodName): void {
  const handler = PlanController.prototype[methodName];

  expect(
    reflector.getAllAndOverride(ROLES_KEY, [PlanController, handler]),
  ).toBeUndefined();
  expect(Reflect.getMetadata('__guards__', PlanController)).toBeUndefined();
  expect(Reflect.getMetadata('__guards__', handler)).toBeUndefined();
}
