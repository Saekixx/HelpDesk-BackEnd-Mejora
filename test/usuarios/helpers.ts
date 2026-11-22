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
} from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { map, Observable } from 'rxjs';
import { expect, type Mock, vi } from 'vitest';

import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { ROLES_KEY } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { DomainException } from '@/common/domain/domain.exception';
import { RolesController } from '@/usuarios/infrastructure/controllers/roles.controller';
import { UsersController } from '@/usuarios/infrastructure/controllers/users.controller';
import { AssignRolUseCase } from '@/usuarios/application/use-cases/assign-rol.use-case';
import { CreateUserUseCase } from '@/usuarios/application/use-cases/create-user.use-case';
import { GetRolesUseCase } from '@/usuarios/application/use-cases/get-roles.use-case';
import { GetUserByIdUseCase } from '@/usuarios/application/use-cases/get-user-by-id.use-case';
import { GetUserOptionUseCase } from '@/usuarios/application/use-cases/get-user-option.use-case';
import { GetUserStatsUseCase } from '@/usuarios/application/use-cases/get-user-stats.use-case';
import { GetUsersUseCase } from '@/usuarios/application/use-cases/get-users.use-case';
import { ToggleUserStatusUseCase } from '@/usuarios/application/use-cases/toggle-user-status.use-case';
import { UpdateProfileUseCase } from '@/usuarios/application/use-cases/update-profile.use-case';
import { UpdateUserUseCase } from '@/usuarios/application/use-cases/update-user.use-case';

const GUARDS_METADATA = '__guards__';

export type UsuariosMethodName =
  | 'findOptions'
  | 'getEstadisticas'
  | 'findAll'
  | 'findOne'
  | 'create'
  | 'update'
  | 'updateUser'
  | 'updateRole'
  | 'toggleStatus';

export interface UsuariosUseCaseMocks {
  createUser: { execute: Mock };
  updateUser: { execute: Mock };
  updateProfile: { execute: Mock };
  getUserById: { execute: Mock };
  getUsers: { execute: Mock };
  assignRol: { execute: Mock };
  toggleUserStatus: { execute: Mock };
  getUserOption: { execute: Mock };
  getUserStats: { execute: Mock };
  getRoles: { execute: Mock };
}

/** Estado del usuario simulado por el guard de autenticación del test. */
export interface TestAuthState {
  authenticated: boolean;
  userId: number;
  role?: string;
}

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

export function createUsuariosMocks(): UsuariosUseCaseMocks {
  return {
    createUser: { execute: vi.fn() },
    updateUser: { execute: vi.fn() },
    updateProfile: { execute: vi.fn() },
    getUserById: { execute: vi.fn() },
    getUsers: { execute: vi.fn() },
    assignRol: { execute: vi.fn() },
    toggleUserStatus: { execute: vi.fn() },
    getUserOption: { execute: vi.fn() },
    getUserStats: { execute: vi.fn() },
    getRoles: { execute: vi.fn() },
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

const reflector = new Reflector();

export async function createUsuariosTestApp(
  mocks: UsuariosUseCaseMocks,
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
    controllers: [UsersController, RolesController],
    providers: [
      { provide: CreateUserUseCase, useValue: mocks.createUser },
      { provide: UpdateUserUseCase, useValue: mocks.updateUser },
      { provide: UpdateProfileUseCase, useValue: mocks.updateProfile },
      { provide: GetUserByIdUseCase, useValue: mocks.getUserById },
      { provide: GetUsersUseCase, useValue: mocks.getUsers },
      { provide: AssignRolUseCase, useValue: mocks.assignRol },
      { provide: ToggleUserStatusUseCase, useValue: mocks.toggleUserStatus },
      { provide: GetUserOptionUseCase, useValue: mocks.getUserOption },
      { provide: GetUserStatsUseCase, useValue: mocks.getUserStats },
      { provide: GetRolesUseCase, useValue: mocks.getRoles },
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

/** Verifica la metadata real de guards/roles declarada en UsersController. */
export function expectUserGuards(
  methodName: UsuariosMethodName,
  options: { roles?: RolEnum[] } = {},
): void {
  const handler = UsersController.prototype[methodName] as (
    ...args: unknown[]
  ) => unknown;

  const guards = reflector.getAllAndOverride<unknown[]>(GUARDS_METADATA, [
    handler,
    UsersController,
  ]);
  const roles = reflector.getAllAndOverride<string[]>(ROLES_KEY, [
    handler,
    UsersController,
  ]);

  if (options.roles === undefined) {
    expect(guards).toEqual([JwtAuthGuard]);
    expect(roles).toBeUndefined();
    return;
  }

  expect(guards).toEqual([JwtAuthGuard, RoleGuard]);
  expect(roles).toEqual(options.roles);
}

/** Verifica que RolesController sea público (sin guards ni roles). */
export function expectRolesControllerIsPublic(): void {
  expect(
    Reflect.getMetadata(GUARDS_METADATA, RolesController),
  ).toBeUndefined();
  expect(
    Reflect.getMetadata(GUARDS_METADATA, RolesController.prototype.findAll),
  ).toBeUndefined();
  expect(
    reflector.getAllAndOverride(ROLES_KEY, [
      RolesController.prototype.findAll,
      RolesController,
    ]),
  ).toBeUndefined();
}
