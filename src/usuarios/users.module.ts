import { forwardRef, Get, Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { ROL_REPOSITORY } from './domain/ports/rol.repository.port';

// Repositorios de Prisma
import { UserPrismaRepository } from './infrastructure/adapters/persistence/user-prisma.repository';
import { RolPrismaRepository } from './infrastructure/adapters/persistence/rol-prisma.repository';

// Controladores y Casos de Uso
import { UsersController } from './infrastructure/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { AssignRolUseCase } from './application/use-cases/assign-rol.use-case';
import { ToggleUserStatusUseCase } from './application/use-cases/toggle-user-status.use-case';

import { AuthModule } from '@/auth/auth.module';
import { CommonModule } from '@/common/common.module'; // Ajusta la ruta a tu PrismaModule
import { RolesController } from './infrastructure/controllers/roles.controller';
import { GetRolesUseCase } from './application/use-cases/get-roles.use-case';

@Module({
  imports: [
    CommonModule, // Se encarga de proveer PrismaService
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController, RolesController],
  providers: [
    // Casos de Uso
    GetUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    UpdateProfileUseCase,
    AssignRolUseCase,
    ToggleUserStatusUseCase,
    GetRolesUseCase,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: ROL_REPOSITORY,
      useClass: RolPrismaRepository,
    },
  ],
  exports: [USER_REPOSITORY, ROL_REPOSITORY],
})
export class UsuariosModule {}
