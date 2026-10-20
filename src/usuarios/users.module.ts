import { forwardRef, Get, Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { ROL_REPOSITORY } from './domain/ports/rol.repository.port';
import { BULK_USER_FILE_PORT } from './domain/ports/bulk-user-file.port';

// Repositorios de Prisma
import { UserPrismaRepository } from './infrastructure/adapters/persistence/user-prisma.repository';
import { RolPrismaRepository } from './infrastructure/adapters/persistence/rol-prisma.repository';
import { ExcelJsBulkUserFileAdapter } from './infrastructure/adapters/files/exceljs-bulk-user-file.adapter';

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
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { SendVerificationEmailUseCase } from '@/mail/application/send-verification-email.use-case';
import { SendResetPasswordEmailUseCase } from '@/mail/application/send-reset-password-email.use-case';
import { MailModule } from '@/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GetUserOptionUseCase } from './application/use-cases/get-user-option.use-case';
import { GetUserStatsUseCase } from './application/use-cases/get-user-stats.use-case';
import { GetBulkUserTemplateUseCase } from './application/use-cases/get-bulk-user-template.use-case';

@Module({
  imports: [
    ConfigModule,
    CommonModule, // Se encarga de proveer PrismaService
    MailModule, // Se encarga de proveer MailerService
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController, RolesController],
  providers: [
    // Casos de uso de Mail
    SendVerificationEmailUseCase,
    SendResetPasswordEmailUseCase,

    // Casos de Uso
    GetUsersUseCase,
    GetUserByIdUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateProfileUseCase,
    AssignRolUseCase,
    ToggleUserStatusUseCase,
    GetRolesUseCase,
    GetUserOptionUseCase,
    GetUserStatsUseCase,
    GetBulkUserTemplateUseCase,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
    {
      provide: ROL_REPOSITORY,
      useClass: RolPrismaRepository,
    },
    {
      provide: BULK_USER_FILE_PORT,
      useClass: ExcelJsBulkUserFileAdapter,
    },
  ],
  exports: [USER_REPOSITORY, ROL_REPOSITORY],
})
export class UsuariosModule {}
