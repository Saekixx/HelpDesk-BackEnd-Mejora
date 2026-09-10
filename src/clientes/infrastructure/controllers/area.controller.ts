import { GetAreasOptionsUseCase } from '@/clientes/application/use-cases/area/get-areas-options.use-case';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Areas')
@Controller('areas')
export class AreaController {
  constructor(
    private readonly getAreasOptionsUseCase: GetAreasOptionsUseCase,
  ) {}

  @Get(':id/options')
  async getAreasOptions(@Param('id', ParseIntPipe) id: number) {
    return await this.getAreasOptionsUseCase.execute(id);
  }
}
