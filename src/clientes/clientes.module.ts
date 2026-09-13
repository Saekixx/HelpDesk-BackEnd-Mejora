import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/auth/auth.module';
import { CLIENTE_REPOSITORY } from './domain/ports/cliente.repository.port';
import { SUCURSAL_REPOSITORY } from './domain/ports/sucursal.repository.port';
import { AREA_REPOSITORY } from './domain/ports/area.repository.port';

import { ClientePrismaRepository } from './infrastructure/adapters/persistence/cliente-prisma.repository';
import { SucursalPrismaRepository } from './infrastructure/adapters/persistence/sucursal-prisma.repository';
import { AreaPrismaRepository } from './infrastructure/adapters/persistence/area-prisma.repository';
import { GetAreasOptionsUseCase } from './application/use-cases/area/get-areas-options.use-case';
import { GetSucursalesOptionsUseCase } from './application/use-cases/sucursal/get-sucursales-options.use-case';
import { GetClientesOptionsUseCase } from './application/use-cases/cliente/get-clientes-options.use-case';
import { GetClientesUseCase } from './application/use-cases/cliente/get-clientes.use-case';
import { GetClienteByIdUseCase } from './application/use-cases/cliente/get-cliente-by-id.use-case';
import { CreateClienteUseCase } from './application/use-cases/cliente/create-cliente.use-case';
import { UpdateClienteUseCase } from './application/use-cases/cliente/update-cliente.use-case';
import { ToggleClienteStatusUseCase } from './application/use-cases/cliente/toggle-cliente-status.use-case';
import { ClienteController } from './infrastructure/controllers/cliente.controller';
import { SucursalController } from './infrastructure/controllers/sucursal.controller';
import { AreaController } from './infrastructure/controllers/area.controller';

@Module({
  // AuthModule se agrega para que Nest pueda resolver las dependencias de
  // JwtAuthGuard y RoleGuard usados en ClienteController (ver
  // @UseGuards(JwtAuthGuard, RoleGuard) en cliente.controller.ts).
  imports: [CommonModule, AuthModule],
  controllers: [AreaController, SucursalController, ClienteController],
  providers: [
    // Casos de Uso - Clientes
    GetClientesOptionsUseCase,
    GetClientesUseCase,
    GetClienteByIdUseCase,
    CreateClienteUseCase,
    UpdateClienteUseCase,
    ToggleClienteStatusUseCase,
    // Casos de Uso - Sucursales / Áreas
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