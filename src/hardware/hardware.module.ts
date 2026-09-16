import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { HARDWARE_REPOSITORY } from './domain/ports/hardware.repository.port';
import { HardwarePrismaRepository } from './infrastructure/adapters/persistence/hardware-prisma-repository';
import { ToggleHardwareStatusUseCase } from './application/use-cases/toggle-hardware-status.usecase';
import { UpdateHardwareUseCase } from './application/use-cases/update-hardware.usecase';
import { FindByIdHardwareUseCase } from './application/use-cases/find-by-id-hardware.usecase';
import { FindAllHardwareUseCase } from './application/use-cases/find-all-hardware.usecase';
import { CreateHardwareUseCase } from './application/use-cases/create-hardware.usecase';
import { HardwareController } from './infrastructure/controllers/hardware.controller';

@Module({
  imports: [CommonModule],
  controllers: [HardwareController],
  providers: [
    CreateHardwareUseCase,
    FindAllHardwareUseCase,
    FindByIdHardwareUseCase,
    UpdateHardwareUseCase,
    ToggleHardwareStatusUseCase,

    // Inyección de dependencia mediante símbolo/puerto
    {
      provide: HARDWARE_REPOSITORY,
      useClass: HardwarePrismaRepository,
    },
  ],
  exports: [
    HARDWARE_REPOSITORY,
    CreateHardwareUseCase,
    FindAllHardwareUseCase,
    FindByIdHardwareUseCase,
    UpdateHardwareUseCase,
    ToggleHardwareStatusUseCase,
  ],
})
export class HardwareModule {}