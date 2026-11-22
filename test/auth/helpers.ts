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

import { AuthController } from '@/auth/infrastructure/controllers/auth.controller';
import { ConfirmRegisterUseCase } from '@/auth/application/use-cases/confirm-register.use-case';
import { ForgotPasswordUseCase } from '@/auth/application/use-cases/forgot-password.use-case';
import { LoginUseCase } from '@/auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@/auth/application/use-cases/register.use-case';
import { ResetPasswordUseCase } from '@/auth/application/use-cases/reset-password.use-case';
import { ROLES_KEY } from '@/auth/infrastructure/decorators/roles.decorator';
import { DomainException } from '@/common/domain/domain.exception';

type AuthMethodName =
  | 'login'
  | 'register'
  | 'confirmRegister'
  | 'forgotPassword'
  | 'resetPassword';

export interface AuthUseCaseMocks {
  login: { execute: Mock };
  register: { execute: Mock };
  confirmRegister: { execute: Mock };
  forgotPassword: { execute: Mock };
  resetPassword: { execute: Mock };
}

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

export function createAuthMocks(): AuthUseCaseMocks {
  return {
    login: { execute: vi.fn() },
    register: { execute: vi.fn() },
    confirmRegister: { execute: vi.fn() },
    forgotPassword: { execute: vi.fn() },
    resetPassword: { execute: vi.fn() },
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

export async function createAuthTestApp(
  mocks: AuthUseCaseMocks,
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: LoginUseCase, useValue: mocks.login },
      { provide: RegisterUseCase, useValue: mocks.register },
      { provide: ConfirmRegisterUseCase, useValue: mocks.confirmRegister },
      { provide: ForgotPasswordUseCase, useValue: mocks.forgotPassword },
      { provide: ResetPasswordUseCase, useValue: mocks.resetPassword },
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

export function expectNoGuardsOrRoles(methodName: AuthMethodName): void {
  const handler = AuthController.prototype[methodName];

  expect(
    reflector.getAllAndOverride(ROLES_KEY, [AuthController, handler]),
  ).toBeUndefined();
  expect(Reflect.getMetadata('__guards__', AuthController)).toBeUndefined();
  expect(Reflect.getMetadata('__guards__', handler)).toBeUndefined();
}
