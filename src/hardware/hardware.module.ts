import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/auth/auth.module';
import { HARDWARE_REPOSITORY } from './domain/ports/hardware.repository.port';
import { HardwarePrismaRepository } from './infrastructure/adapters/persistence/hardware-prisma.repository';
import { CreateHardwareUseCase } from './application/use-cases/create-hardware.usecase';
import { FindAllHardwareUseCase } from './application/use-cases/find-all-hardware.usecase';
import { FindByIdHardwareUseCase } from './application/use-cases/find-by-id-hardware.usecase';
import { GetHardwareOptionsUseCase } from './application/use-cases/get-hardware-options.usecase';
import { TransitionHardwareUseCase } from './application/use-cases/transition-hardware.usecase';
import { UpdateHardwareUseCase } from './application/use-cases/update-hardware.usecase';
import { HardwareController } from './infrastructure/controllers/hardware.controller';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [HardwareController],
  providers: [
    // Casos de Uso
    CreateHardwareUseCase,
    FindAllHardwareUseCase,
    FindByIdHardwareUseCase,
    GetHardwareOptionsUseCase,
    UpdateHardwareUseCase,
    TransitionHardwareUseCase,

    // Repositorio
    {
      provide: HARDWARE_REPOSITORY,
      useClass: HardwarePrismaRepository,
    },
  ],
  exports: [HARDWARE_REPOSITORY],
})
export class HardwareModule {}
