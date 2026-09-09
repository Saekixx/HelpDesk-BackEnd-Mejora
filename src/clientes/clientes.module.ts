import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { CLIENTE_REPOSITORY } from './domain/ports/cliente.repository.port';
import { SUCURSAL_REPOSITORY } from './domain/ports/sucursal.repository.port';
import { AREA_REPOSITORY } from './domain/ports/area.repository.port';

import { ClientePrismaRepository } from './infrastructure/adapters/persistence/cliente-prisma.repository';
import { SucursalPrismaRepository } from './infrastructure/adapters/persistence/sucursal-prisma.repository';
import { AreaPrismaRepository } from './infrastructure/adapters/persistence/area-prisma.repository';

@Module({
  imports: [CommonModule],
  providers: [
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
