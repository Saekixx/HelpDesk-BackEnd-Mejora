import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { SOFTWARE_REPOSITORY } from './domain/ports/software.repository.port';
import { SoftwarePrismaRepository } from './infrastructure/adapters/persistence/software-prisma.repository';

import { SOFTWARE_EQUIPMENT_REPOSITORY } from './domain/ports/software-equipment.repository.port';
import { SoftwareEquipmentPrismaRepository } from './infrastructure/adapters/persistence/software-equipment-prisma.repository';

import { CreateSoftwareUseCase } from './application/use-cases/create-software.usecase';
import { FindAllSoftwareUseCase } from './application/use-cases/find-all-software.usecase';
import { FindByIdSoftwareUseCase } from './application/use-cases/find-by-id-software.usecase';
import { GetSoftwareUseCase } from './application/use-cases/get-software.usecase';
import { ToggleSoftwareStatusUseCase } from './application/use-cases/toggle-software-status.usecase';
import { UpdateSoftwareUseCase } from './application/use-cases/update-software.usecase';

import { AssignEquipmentUseCase } from './application/use-cases/assign-equipment.usecase';
import { ReleaseEquipmentUseCase } from './application/use-cases/release-equipment.usecase';

import { SoftwareController } from './infrastructure/controllers/software.controller';
import { FindByIdSoftwareEquipoUseCase } from './application/use-cases/get-software-equipos.usecase';

@Module({
  imports: [CommonModule],
  controllers: [SoftwareController],
  providers: [
    CreateSoftwareUseCase,
    FindAllSoftwareUseCase,
    FindByIdSoftwareUseCase,
    FindByIdSoftwareEquipoUseCase,
    GetSoftwareUseCase,
    UpdateSoftwareUseCase,
    ToggleSoftwareStatusUseCase,

    AssignEquipmentUseCase,
    ReleaseEquipmentUseCase,

    {
      provide: SOFTWARE_REPOSITORY,
      useClass: SoftwarePrismaRepository,
    },

    {
      provide: SOFTWARE_EQUIPMENT_REPOSITORY,
      useClass: SoftwareEquipmentPrismaRepository,
    },
  ],
  exports: [SOFTWARE_REPOSITORY, SOFTWARE_EQUIPMENT_REPOSITORY],
})
export class SoftwareModule {}
