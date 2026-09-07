import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/entities/user.entity';
import { RolEntity } from './infrastructure/entities/rol.entity'; // Importar entidad de Rol

import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { ROL_REPOSITORY } from './domain/ports/rol.repository.port'; // Crear puerto si no existe

import { UserTypeOrmRepository } from './infrastructure/adapters/user-typeorm.repository';
import { RolTypeOrmRepository } from './infrastructure/adapters/rol-typeorm.repository';
import { UsersController } from './infrastructure/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RolEntity]), // Registrar ambas entidades
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    // Casos de Usos
    CreateUserUseCase,
    UpdateProfileUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeOrmRepository,
    },
    {
      provide: ROL_REPOSITORY,
      useClass: RolTypeOrmRepository,
    },
  ],
  exports: [USER_REPOSITORY, ROL_REPOSITORY],
})
export class UsuariosModule {}
