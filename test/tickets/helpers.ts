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
import express from 'express';
import { map, Observable } from 'rxjs';
import { expect, type Mock, vi } from 'vitest';

import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { ROLES_KEY } from '@/auth/infrastructure/decorators/roles.decorator';
import { DomainException } from '@/common/domain/domain.exception';
import { RegisterCloseAuditUseCase } from '@/auditoria/application/use-case/register-close-audit.use-case';
import { RegisterReopeningAuditUseCase } from '@/auditoria/application/use-case/register-reopening-audit.use-case';
import { AssignSupportTicketUseCase } from '@/tickets/application/use-cases/assign-support-ticket.use-case';
import { CloseTicketUseCase } from '@/tickets/application/use-cases/close-ticket.use-case';
import { CreateTicketUseCase } from '@/tickets/application/use-cases/create-ticket.use-case';
import { GetTicketDetalleUseCase } from '@/tickets/application/use-cases/get-ticket-detalle.use-case';
import { GetTicketsUseCase } from '@/tickets/application/use-cases/get-tickets.use-case';
import { ReopenTicketUseCase } from '@/tickets/application/use-cases/reopen-ticket.use-case';
import { RolUsuario } from '@/tickets/domain/entities/ticket.entity';
import { TicketsController } from '@/tickets/infrastructure/controller/tickets.controller';

type TicketsMethodName =
  | 'findAll'
  | 'findById'
  | 'create'
  | 'close'
  | 'reopen'
  | 'assignSupport';

export interface TicketsUseCaseMocks {
  getTickets: { execute: Mock };
  getTicketDetalle: { execute: Mock };
  createTicket: { execute: Mock };
  closeTicket: { execute: Mock };
  reopenTicket: { execute: Mock };
  assignSupport: { execute: Mock };
}

/** Estado del usuario simulado por el guard de autenticación del test. */
export interface TestAuthState {
  authenticated: boolean;
  userId: number;
  role?: string;
}

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

export function createTicketsMocks(): TicketsUseCaseMocks {
  return {
    getTickets: { execute: vi.fn() },
    getTicketDetalle: { execute: vi.fn() },
    createTicket: { execute: vi.fn() },
    closeTicket: { execute: vi.fn() },
    reopenTicket: { execute: vi.fn() },
    assignSupport: { execute: vi.fn() },
  };
}

export function workerAuthState(
  overrides: Partial<TestAuthState> = {},
): TestAuthState {
  return {
    authenticated: true,
    userId: 10,
    role: RolUsuario.CLIENTE_TRABAJADOR,
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

/** Crea una app de prueba con JwtAuthGuard simulado, sin Passport, DB ni Redis. */
export async function createTicketsTestApp(
  mocks: TicketsUseCaseMocks,
  authState: TestAuthState = workerAuthState(),
): Promise<INestApplication> {
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
    controllers: [TicketsController],
    providers: [
      { provide: GetTicketsUseCase, useValue: mocks.getTickets },
      { provide: GetTicketDetalleUseCase, useValue: mocks.getTicketDetalle },
      { provide: CreateTicketUseCase, useValue: mocks.createTicket },
      { provide: CloseTicketUseCase, useValue: mocks.closeTicket },
      { provide: ReopenTicketUseCase, useValue: mocks.reopenTicket },
      { provide: AssignSupportTicketUseCase, useValue: mocks.assignSupport },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue(jwtGuard)
    .compile();

  // El parser estricto por defecto de Nest rechaza bodies primitivos JSON
  // (necesarios para `assign-support`). En el test se habilita el modo no
  // estricto para poder ejercitar el contrato real del controlador.
  const app = moduleRef.createNestApplication({ bodyParser: false });
  app.use(express.json({ strict: false }));
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

/**
 * TicketsController solo declara JwtAuthGuard. @Roles existe únicamente en
 * `create` y, al no registrar RoleGuard, no se enforcea en runtime.
 */
export function expectTicketsGuards(
  methodName: TicketsMethodName,
  expectedRoles?: RolUsuario[],
): void {
  const handler = TicketsController.prototype[methodName];

  expect(Reflect.getMetadata('__guards__', TicketsController)).toEqual([
    JwtAuthGuard,
  ]);
  expect(Reflect.getMetadata('__guards__', TicketsController)).not.toContain(
    RoleGuard,
  );
  expect(Reflect.getMetadata('__guards__', handler)).toBeUndefined();
  expect(
    reflector.getAllAndOverride(ROLES_KEY, [handler, TicketsController]),
  ).toEqual(expectedRoles);
}

/** Mocks del repositorio de tickets para los specs de casos de uso. */
export function createTicketRepositoryMock(): {
  save: Mock;
  findById: Mock;
  findByPin: Mock;
  findAllWithFilters: Mock;
  findDetailById: Mock;
  findPendientesParaAutoAsignacion: Mock;
} {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findByPin: vi.fn(),
    findAllWithFilters: vi.fn(),
    findDetailById: vi.fn(),
    findPendientesParaAutoAsignacion: vi.fn(),
  };
}

/** Mocks de repositorios/casos de uso auxiliares usados por otros casos de uso. */
export function createTicketDepsMock(): {
  equipoRepository: { isEquipoOwnedByUsuario: Mock };
  userRepository: { findRemoteTechniciansWithWorkload: Mock };
  registerCloseAudit: { execute: Mock };
  registerReopeningAudit: { execute: Mock };
} {
  return {
    equipoRepository: { isEquipoOwnedByUsuario: vi.fn() },
    userRepository: { findRemoteTechniciansWithWorkload: vi.fn() },
    registerCloseAudit: { execute: vi.fn() },
    registerReopeningAudit: { execute: vi.fn() },
  };
}
