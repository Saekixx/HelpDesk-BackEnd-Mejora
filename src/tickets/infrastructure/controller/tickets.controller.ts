import { GetTicketsUseCase } from '@/tickets/application/use-cases/get-tickets.use-case';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiFindAllTicketsSwagger } from '../docs/tickets.swagger';
import { GetTicketsFilterDto } from '../dtos/get-tickets-query.dto';

@ApiTags('Tickets')
@Controller('ticket')
export class TicketsController {
  constructor(private readonly getTicketsUseCase: GetTicketsUseCase) {}

  @Get()
  @ApiFindAllTicketsSwagger()
  async findAll(@Query() query: GetTicketsFilterDto) {
    const data = await this.getTicketsUseCase.execute(query);
    return {
      message: 'Tickets obtenidos exitosamente',
      data,
    };
  }
}
