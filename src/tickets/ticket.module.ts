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
import { StartChatTicketUseCase } from '@/tickets/application/use-cases/start-chat-ticket.use-case';
import { ReopenTicketUseCase } from '@/tickets/application/use-cases/reopen-ticket.use-case';
import { CloseTicketUseCase } from '@/tickets/application/use-cases/close-ticket.use-case';
import { EquiposModule } from '@/equipos/equipos.module';

@Module({
  imports: [
    ConfigModule,
    CommonModule, // Se encarga de proveer PrismaService
    EquiposModule, // Se encarga de proveer EquipoRepositoryPort
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [TicketsController],
  providers: [
    // Casos de Uso
    GetTicketsUseCase,
    CreateTicketUseCase,
    AssignSupportTicketUseCase,
    StartChatTicketUseCase,
    ReopenTicketUseCase,
    CloseTicketUseCase,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: TICKET_REPOSITORY,
      useClass: TicketPrismaRepository,
    },
  ],
  exports: [TICKET_REPOSITORY],
})
export class TicketModule {}
