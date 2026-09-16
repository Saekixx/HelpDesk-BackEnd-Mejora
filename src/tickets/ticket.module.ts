import { forwardRef, Module } from '@nestjs/common';
import { TicketsController } from './infrastructure/controller/tickets.controller';
import { GetTicketsUseCase } from './application/use-cases/get-tickets.use-case';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@/auth/auth.module';
import { TICKET_REPOSITORY } from './domain/ports/ticket.repository.port';
import { TicketPrismaRepository } from './infrastructure/adapter/persistence/ticket-prisma.repository';

@Module({
  imports: [
    ConfigModule,
    CommonModule, // Se encarga de proveer PrismaService
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [TicketsController],
  providers: [
    // Casos de Uso
    GetTicketsUseCase,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: TICKET_REPOSITORY,
      useClass: TicketPrismaRepository,
    },
  ],
  exports: [TICKET_REPOSITORY],
})
export class TicketModule {}
