import { AuditoriaModule } from '@/auditoria/auditoria.module';
import { AuthModule } from '@/auth/auth.module';
import { CommonModule } from '@/common/common.module';
import { TicketModule } from '@/tickets/ticket.module'; // <--- 1. Importa tu TicketModule (ajusta la ruta según corresponda)
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CreateCitaAndDerivateTicketUseCase } from './application/use-case/citas/create-cita-and-derivate-ticket.use-case';
import { CreateSoftLockUseCase } from './application/use-case/softlock/create-soft-lock.use-case';
import { GetAvailableSlotsUseCase } from './application/use-case/softlock/get-available-slots.use-case';
import { PrismaSoftLockRepository } from './infrastructure/adapter/persistence/prisma-soft-lock.repository';
import { PrismaCitaSoporteRepository } from './infrastructure/adapter/persistence/prisma-cita-soporte.repository';
import { CITA_SOPORTE_REPOSITORY } from './domain/port/cita-soporte.repository.port';
import { SOFT_LOCK_REPOSITORY } from './domain/port/soft-lock.repository.port';
import { CitasSoporteController } from './infrastructure/controller/citas-soporte.controller';
import { SoftLockController } from './infrastructure/controller/softLock.controller';
import { AutoAssignInsituUseCase } from './application/use-case/citas/auto-assign-insitu.use-case';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    AuditoriaModule,
    JwtModule.register({}),
    forwardRef(() => AuthModule),
    TicketModule,
  ],
  controllers: [CitasSoporteController, SoftLockController],
  providers: [
    // Casos de Uso Citas
    CreateCitaAndDerivateTicketUseCase,
    AutoAssignInsituUseCase,

    // Casos de Uso SoftLock
    CreateSoftLockUseCase,
    GetAvailableSlotsUseCase,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: SOFT_LOCK_REPOSITORY,
      useClass: PrismaSoftLockRepository,
    },
    {
      provide: CITA_SOPORTE_REPOSITORY,
      useClass: PrismaCitaSoporteRepository,
    },
  ],
  exports: [SOFT_LOCK_REPOSITORY, CITA_SOPORTE_REPOSITORY],
})
export class CitasModule {}
