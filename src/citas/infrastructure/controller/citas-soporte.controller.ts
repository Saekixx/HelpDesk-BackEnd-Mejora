import { Controller, Post, Body } from '@nestjs/common';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { CreateCitaAndDerivateTicketUseCase } from '@/citas/application/use-case/citas/create-cita-and-derivate-ticket.use-case';
import { ApiCreateCitaAndDerivateTicketSwagger } from '../docs/citas-soporte.swagger';

@Controller('citas-soporte')
export class CitasSoporteController {
  constructor(
    private readonly createCitaAndDerivateTicketUseCase: CreateCitaAndDerivateTicketUseCase,
  ) {}

  @Post('derivar')
  @ApiCreateCitaAndDerivateTicketSwagger()
  async derivarTicketInSitu(@Body() dto: CreateCitaDto) {
    return await this.createCitaAndDerivateTicketUseCase.execute(dto);
  }
}
