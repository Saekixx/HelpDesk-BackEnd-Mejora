import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  ApiAssignSupportSwagger,
  ApiCloseTicketSwagger,
  ApiCreateTicketSwagger,
  ApiFindAllTicketsSwagger,
  ApiFindOneTicketSwagger,
  ApiReopenTicketSwagger,
} from '../docs/tickets.swagger';

import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { GetTicketsFilterDto } from '../dtos/get-tickets-query.dto';

import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/infrastructure/decorators/current-user.decorator';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';

import { GetTicketsUseCase } from '@/tickets/application/use-cases/get-tickets.use-case';
import { CreateTicketUseCase } from '@/tickets/application/use-cases/create-ticket.use-case';
import { AssignSupportTicketUseCase } from '@/tickets/application/use-cases/assign-support-ticket.use-case';
import { ReopenTicketUseCase } from '@/tickets/application/use-cases/reopen-ticket.use-case';
import { CloseTicketUseCase } from '@/tickets/application/use-cases/close-ticket.use-case';
import { RolUsuario } from '@/tickets/domain/entities/ticket.entity';
import { GetTicketDetalleUseCase } from '@/tickets/application/use-cases/get-ticket-detalle.use-case';
import { CerrarTicketDto } from '../dtos/close-ticket.request';
import { ReabrirTicketDto } from '../dtos/reopen-ticket.request';

@ApiTags('Tickets')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ticket')
export class TicketsController {
  constructor(
    private readonly getTicketsUseCase: GetTicketsUseCase,
    private readonly getTicketDetalleUseCase: GetTicketDetalleUseCase,
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly closeTicketUseCase: CloseTicketUseCase,
    private readonly assignSupportTicketUseCase: AssignSupportTicketUseCase,
    private readonly reopenTicketUseCase: ReopenTicketUseCase,
  ) {}

  @Get()
  @ApiFindAllTicketsSwagger()
  async findAll(@Query() query: GetTicketsFilterDto) {
    const result = await this.getTicketsUseCase.execute(query);
    return {
      message: 'Tickets obtenidos exitosamente',
      data: {
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Get(':id')
  @ApiFindOneTicketSwagger()
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getTicketDetalleUseCase.execute(id);
    return {
      message: 'Ticket obtenido exitosamente',
      data,
    };
  }

  @Post()
  @Roles(RolUsuario.CLIENTE_TRABAJADOR)
  @ApiCreateTicketSwagger()
  async create(
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateTicketDto,
  ) {
    const data = await this.createTicketUseCase.execute(userId, dto);
    return {
      message: 'Ticket creado exitosamente',
      data,
    };
  }

  @Patch(':id/close')
  @ApiCloseTicketSwagger()
  async close(
    @Param('id', ParseIntPipe) idTicket: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: CerrarTicketDto,
  ) {
    const data = await this.closeTicketUseCase.execute(
      idTicket,
      Number(userId),
      dto.reporte_cierre,
    );
    return {
      message: 'Ticket cerrado correctamente',
      data,
    };
  }

  @Patch(':id/reopen')
  @ApiReopenTicketSwagger()
  async reopen(
    @Param('id', ParseIntPipe) idTicket: number,
    @CurrentUser('userId') userId: number,
    @Body() dto: ReabrirTicketDto,
  ) {
    const data = await this.reopenTicketUseCase.execute(
      idTicket,
      Number(userId),
      dto.motivo_reapertura,
    );
    return {
      message: 'Ticket reabierto correctamente',
      data,
    };
  }

  @Patch(':id/assign-support')
  @ApiAssignSupportSwagger()
  async assignSupport(
    @Param('id', ParseIntPipe) id: number,
    @Body() idSoporte: number,
  ) {
    const data = await this.assignSupportTicketUseCase.execute(id, idSoporte);
    return {
      message: 'Soporte asignado correctamente',
      data,
    };
  }
}
