import { GetClientesOptionsUseCase } from '@/clientes/application/use-cases/cliente/get-clientes-options.use-case';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Clientes')
@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly getClientesOptionsUseCase: GetClientesOptionsUseCase,
  ) {}

  @Get('/options')
  async getClientesOptions() {
    return await this.getClientesOptionsUseCase.execute();
  }
}
