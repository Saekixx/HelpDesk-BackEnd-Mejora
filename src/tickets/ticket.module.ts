// src/modules/tickets/ticket.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TicketsController } from './infrastructure/controller/tickets.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@/auth/auth.module';
import { TICKET_REPOSITORY } from './domain/ports/ticket.repository.port';
import { TicketPrismaRepository } from './infrastructure/adapter/persistence/ticket-prisma.repository';

import { GetTicketsUseCase } from '@/tickets/application/use-cases/get-tickets.use-case';
import { CreateTicketUseCase } from '@/tickets/application/use-cases/create-ticket.use-case';
import { AssignSupportTicketUseCase } from '@/tickets/application/use-cases/assign-support-ticket.use-case';
import { ReopenTicketUseCase } from '@/tickets/application/use-cases/reopen-ticket.use-case';
import { CloseTicketUseCase } from '@/tickets/application/use-cases/close-ticket.use-case';
import { DerivateTicketToInSituUseCase } from '@/tickets/application/use-cases/derivate-ticket-to-insitu.use-case'; // <-- 1. Importar caso de uso
import { EquiposModule } from '@/equipos/equipos.module';
import { GetTicketDetalleUseCase } from './application/use-cases/get-ticket-detalle.use-case';
import { AuditoriaModule } from '@/auditoria/auditoria.module';
import { AutoAssignPendingTicketsUseCase } from './application/use-cases/auto-assign-pending-tickets.use-case';
import { TicketsCronService } from './infrastructure/cron/tickets.cron.service';
import { ChatModule } from '@/chat/chat.module';
import { TicketsGateway } from './infrastructure/websocket/tickets.gateway';
import { CitasModule } from '@/citas/citas.module';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    EquiposModule,
    AuditoriaModule,
    forwardRef(() => CitasModule),
    forwardRef(() => ChatModule),
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [TicketsController],
  providers: [
    // Casos de Uso
    GetTicketsUseCase,
    GetTicketDetalleUseCase,
    CreateTicketUseCase,
    AssignSupportTicketUseCase,
    ReopenTicketUseCase,
    CloseTicketUseCase,
    DerivateTicketToInSituUseCase,

    AutoAssignPendingTicketsUseCase,
    TicketsCronService,
    TicketsGateway,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: TICKET_REPOSITORY,
      useClass: TicketPrismaRepository,
    },
  ],
  exports: [TICKET_REPOSITORY, DerivateTicketToInSituUseCase],
})
export class TicketModule {}
