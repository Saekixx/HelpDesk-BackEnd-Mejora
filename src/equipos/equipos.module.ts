import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/auth/auth.module';
import { EQUIPO_REPOSITORY } from './domain/ports/equipo.repository.port';
import { EquipoPrismaRepository } from './infrastructure/repositories/equipo-prisma.repository';
import { GetEquiposUseCase } from './application/use-cases/get-equipos.use-case';
import { GetEquipoByIdUseCase } from './application/use-cases/get-equipo-by-id.use-case';
import { CreateEquipoUseCase } from './application/use-cases/create-equipo.use-case';
import { UpdateEquipoUseCase } from './application/use-cases/update-equipo.use-case';
import { ToggleStatusEquipoUseCase } from './application/use-cases/toggle-status-equipo.use-case';
import { EquipoController } from './infrastructure/controllers/equipo.controller';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [EquipoController],
  providers: [
    GetEquiposUseCase,
    GetEquipoByIdUseCase,
    CreateEquipoUseCase,
    UpdateEquipoUseCase,
    ToggleStatusEquipoUseCase,
    {
      provide: EQUIPO_REPOSITORY,
      useClass: EquipoPrismaRepository,
    },
  ],
  exports: [EQUIPO_REPOSITORY],
})
export class EquiposModule {}