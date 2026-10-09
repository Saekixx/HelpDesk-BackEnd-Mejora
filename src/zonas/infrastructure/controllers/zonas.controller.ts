import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { CreateZonaUseCase } from '@/zonas/application/create-zona.use-case';
import { GetZonaByIddUseCase } from '@/zonas/application/get-zona-by-id.use-case';
import { GetZonasUseCase } from '@/zonas/application/get-zonas.use-case';
import { ToggleZonaStatusUseCase } from '@/zonas/application/toggle-zona-status.use-case';
import { UpdateZonaUseCase } from '@/zonas/application/update-zona.use-case';
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
import { CreateZonaRequest } from '../dtos/create-zona.request';
import { ZonaFilterRequest } from '../dtos/zona-filter.request';
import {
  ApiCreateZona,
  ApiFindAllZonas,
  ApiFindAllZonasOptions,
  ApiFindOneZona,
  ApiToggleZonaStatus,
  ApiUpdateZona,
  ApiZonaController,
} from '../docs/zona.swagger';
import { UpdateZonaRequest } from '../dtos/update-zona.requets';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetZonaOptionsUseCase } from '@/zonas/application/get-zona-options.use-case';

@ApiZonaController()
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('zona')
export class ZonasController {
  constructor(
    private readonly getZonasUseCase: GetZonasUseCase,
    private readonly getZonaOptionsUseCase: GetZonaOptionsUseCase,
    private readonly getZonaByIdUseCase: GetZonaByIddUseCase,
    private readonly createZonaUseCase: CreateZonaUseCase,
    private readonly updateZonaUseCase: UpdateZonaUseCase,
    private readonly toggleZonaStatusUseCase: ToggleZonaStatusUseCase,
  ) {}

  @Get()
  @ApiFindAllZonas()
  async findAll(@Query() filters: ZonaFilterRequest) {
    const data = await this.getZonasUseCase.execute(filters);
    return {
      message: 'Zonas encontradas correctamente',
      data,
    };
  }

  @Get('options')
  @ApiFindAllZonasOptions()
  async findOptions() {
    const data = await this.getZonaOptionsUseCase.execute();

    return {
      message: 'Opciones de zonas encontradas correctamente',
      data: data,
    };
  }

  @Get(':id')
  @ApiFindOneZona()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getZonaByIdUseCase.execute(id);
    return {
      message: 'Zona encontrada correctamente',
      data,
    };
  }

  @Post()
  @ApiCreateZona()
  async create(@Body() dto: CreateZonaRequest) {
    const data = await this.createZonaUseCase.execute(dto);
    return {
      message: 'Zona creada correctamente',
      data,
    };
  }

  @Patch(':id')
  @ApiUpdateZona()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateZonaRequest,
  ) {
    const data = await this.updateZonaUseCase.execute(id, dto);
    return {
      message: 'Zona actualizada correctamente',
      data,
    };
  }

  @Patch(':id/toggle-status')
  @ApiToggleZonaStatus()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.toggleZonaStatusUseCase.execute(id);
  }
}
