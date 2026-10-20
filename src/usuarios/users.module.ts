import { forwardRef, Get, Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { ROL_REPOSITORY } from './domain/ports/rol.repository.port';
import { BULK_USER_FILE_PORT } from './domain/ports/bulk-user-file.port';
import { BULK_USER_LOOKUP_PORT } from './domain/ports/bulk-user-lookup.port';

// Repositorios de Prisma
import { UserPrismaRepository } from './infrastructure/adapters/persistence/user-prisma.repository';
import { RolPrismaRepository } from './infrastructure/adapters/persistence/rol-prisma.repository';
import { BulkUserLookupPrismaRepository } from './infrastructure/adapters/persistence/bulk-user-lookup-prisma.repository';
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
import { ValidateBulkUsersUseCase } from './application/use-cases/validate-bulk-users.use-case';
import { ProcessBulkUsersUseCase } from './application/use-cases/process-bulk-users.use-case';
import { BulkUserRowValidator } from './application/services/bulk-user-row-validator.service';

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
    ValidateBulkUsersUseCase,
    ProcessBulkUsersUseCase,

    // Servicios de aplicación
    BulkUserRowValidator,

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
      provide: BULK_USER_LOOKUP_PORT,
      useClass: BulkUserLookupPrismaRepository,
    },
    {
      provide: BULK_USER_FILE_PORT,
      useClass: ExcelJsBulkUserFileAdapter,
    },
  ],
  exports: [USER_REPOSITORY, ROL_REPOSITORY],
})
export class UsuariosModule {}
