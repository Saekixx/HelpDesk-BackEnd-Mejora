import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { SOFTWARE_REPOSITORY } from './domain/ports/software.repository.port';
import { SoftwarePrismaRepository } from './infrastructure/adapters/persistence/software-prisma.repository';
import { CreateSoftwareUseCase } from './application/use-cases/create-software.usecase';
import { FindAllSoftwareUseCase } from './application/use-cases/find-all-software.usecase';
import { FindByIdSoftwareUseCase } from './application/use-cases/find-by-id-software.usecase';
import { GetSoftwareUseCase } from './application/use-cases/get-software.usecase';
import { ToggleSoftwareStatusUseCase } from './application/use-cases/toggle-software-status.usecase';
import { UpdateSoftwareUseCase } from './application/use-cases/update-software.usecase';
import { SoftwareController } from './infrastructure/controllers/software.controller';

@Module({
  imports: [CommonModule],
  controllers: [SoftwareController],
  providers: [
    // Casos de Uso
    CreateSoftwareUseCase,
    FindAllSoftwareUseCase,
    FindByIdSoftwareUseCase,
    GetSoftwareUseCase,
    UpdateSoftwareUseCase,
    ToggleSoftwareStatusUseCase,

    // Repositorio
    {
      provide: SOFTWARE_REPOSITORY,
      useClass: SoftwarePrismaRepository,
    },
  ],
  exports: [SOFTWARE_REPOSITORY],
})
export class SoftwareModule {}