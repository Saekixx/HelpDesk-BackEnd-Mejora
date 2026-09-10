import { GetSucursalesOptionsUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursales-options.use-case';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sucursales')
@Controller('sucursales')
export class SucursalController {
  constructor(
    private readonly getSucursalesOptionsUseCase: GetSucursalesOptionsUseCase,
  ) {}

  @Get(':id/options')
  async getSucursalesOptions(@Param('id', ParseIntPipe) id: number) {
    return await this.getSucursalesOptionsUseCase.execute(id);
  }
}
