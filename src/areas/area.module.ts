import { Module } from '@nestjs/common';
import { AreaController } from './infrastructure/controllers/area.controller';
import { AreaPrismaRepository } from './infrastructure/adapters/persistence/area-prisma.repository';

// Casos de uso
import { CreateAreaUseCase } from './application/use-cases/create-area.use-case';
import { GetAreasUseCase } from './application/use-cases/get-areas.use-case';
import { GetAreaByIdUseCase } from './application/use-cases/get-area-by-id.use-case';
import { UpdateAreaUseCase } from './application/use-cases/update-area.use-case';
import { ToggleAreaStatusUseCase } from './application/use-cases/toggle-area-status.use-case';

@Module({
  controllers: [AreaController],
  providers: [
    {
      provide: 'AREA_REPOSITORY',
      useClass: AreaPrismaRepository,
    },
    CreateAreaUseCase,
    GetAreasUseCase,
    GetAreaByIdUseCase,
    UpdateAreaUseCase,
    ToggleAreaStatusUseCase,
  ],
  exports: [
    'AREA_REPOSITORY',
  ],
})
export class AreaModule {}