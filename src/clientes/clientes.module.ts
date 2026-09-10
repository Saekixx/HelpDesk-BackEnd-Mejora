import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { CLIENTE_REPOSITORY } from './domain/ports/cliente.repository.port';
import { SUCURSAL_REPOSITORY } from './domain/ports/sucursal.repository.port';
import { AREA_REPOSITORY } from './domain/ports/area.repository.port';

import { ClientePrismaRepository } from './infrastructure/adapters/persistence/cliente-prisma.repository';
import { SucursalPrismaRepository } from './infrastructure/adapters/persistence/sucursal-prisma.repository';
import { AreaPrismaRepository } from './infrastructure/adapters/persistence/area-prisma.repository';
import { GetAreasOptionsUseCase } from './application/use-cases/area/get-areas-options.use-case';
import { GetSucursalesOptionsUseCase } from './application/use-cases/sucursal/get-sucursales-options.use-case';
import { GetClientesOptionsUseCase } from './application/use-cases/cliente/get-clientes-options.use-case';
import { ClienteController } from './infrastructure/controllers/cliente.controller';
import { SucursalController } from './infrastructure/controllers/sucursal.controller';
import { AreaController } from './infrastructure/controllers/area.controller';

@Module({
  imports: [CommonModule],
  controllers: [AreaController, SucursalController, ClienteController],
  providers: [
    // Casos de Uso
    GetClientesOptionsUseCase,
    GetSucursalesOptionsUseCase,
    GetAreasOptionsUseCase,
    {
      provide: CLIENTE_REPOSITORY,
      useClass: ClientePrismaRepository,
    },
    {
      provide: SUCURSAL_REPOSITORY,
      useClass: SucursalPrismaRepository,
    },
    {
      provide: AREA_REPOSITORY,
      useClass: AreaPrismaRepository,
    },
  ],
  exports: [CLIENTE_REPOSITORY, SUCURSAL_REPOSITORY, AREA_REPOSITORY],
})
export class ClientesModule {}
