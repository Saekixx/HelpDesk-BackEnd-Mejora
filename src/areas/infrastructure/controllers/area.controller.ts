import { Controller, Get, Post, Body, Param, Patch, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAreaUseCase } from '../../application/use-cases/create-area.use-case';
import { GetAreasUseCase } from '../../application/use-cases/get-areas.use-case';
import { GetAreaByIdUseCase } from '../../application/use-cases/get-area-by-id.use-case';
import { UpdateAreaUseCase } from '../../application/use-cases/update-area.use-case';
import { ToggleAreaStatusUseCase } from '../../application/use-cases/toggle-area-status.use-case';
import { CreateAreaDto } from '../../application/dtos/create-area.dto';
import { UpdateAreaDto } from '../../application/dtos/update-area.dto';
import { FilterAreaDto } from '../../application/dtos/filter-area.dto';
import { ApiGetAreas, ApiCreateArea, ApiGetAreaById, ApiUpdateArea, ApiToggleAreaStatus, ApiGetAreaOptions } from '../docs/area.swagger';

@ApiTags('Áreas')
@Controller('areas')
export class AreaController {
  constructor(
    private readonly createAreaUseCase: CreateAreaUseCase,
    private readonly getAreasUseCase: GetAreasUseCase,
    private readonly getAreaByIdUseCase: GetAreaByIdUseCase,
    private readonly updateAreaUseCase: UpdateAreaUseCase,
    private readonly toggleAreaStatusUseCase: ToggleAreaStatusUseCase,
  ) {}

  @Get()
  @ApiGetAreas()
  async findAll(@Query() filters: FilterAreaDto) {
    const result = await this.getAreasUseCase.execute(filters);
    return {
      status: 200,
      message: 'Operación realizada con éxito',
      data: result.data,
      total: result.total,
      metrics: result.metrics,
    };
  }

  @Get(':id/options')
  @ApiGetAreaOptions()
  async findOptions(@Param('id', ParseIntPipe) id: number) {
    const area = await this.getAreaByIdUseCase.execute(id);
    return {
      status: 200,
      message: 'Operación realizada con éxito',
      data: area,
    };
  }

  @Get(':id')
  @ApiGetAreaById()
  async findById(@Param('id', ParseIntPipe) id: number) {
    const area = await this.getAreaByIdUseCase.execute(id);
    return {
      status: 200,
      message: 'Operación realizada con éxito',
      data: area,
    };
  }

  @Post()
  @ApiCreateArea()
  async create(@Body() dto: CreateAreaDto) {
    const area = await this.createAreaUseCase.execute(dto);
    return {
      status: 201,
      message: 'Área creada con éxito',
      data: area,
    };
  }

  @Patch(':id')
  @ApiUpdateArea()
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAreaDto) {
    const area = await this.updateAreaUseCase.execute(id, dto);
    return {
      status: 200,
      message: 'Área actualizada con éxito',
      data: area,
    };
  }

  @Patch(':id/toggle-status')
  @ApiToggleAreaStatus()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const area = await this.toggleAreaStatusUseCase.execute(id);
    return {
      status: 200,
      message: `Área ${area.is_active ? 'activada' : 'desactivada'} con éxito`,
      data: area,
    };
  }
}