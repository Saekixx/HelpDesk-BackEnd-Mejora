import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateHardwareUseCase } from '@/hardware/application/use-cases/create-hardware.usecase';
import { FindAllHardwareUseCase } from '@/hardware/application/use-cases/find-all-hardware.usecase';
import { FindByIdHardwareUseCase } from '@/hardware/application/use-cases/find-by-id-hardware.usecase';
import { GetHardwareUseCase } from '@/hardware/application/use-cases/get-hardware.usecase';
import { ToggleHardwareStatusUseCase } from '@/hardware/application/use-cases/toggle-hardware-status.usecase';
import { UpdateHardwareUseCase } from '@/hardware/application/use-cases/update-hardware.usecase';
import {
  ApiHardwareTag,
  ApiFindAllHardwareSwagger,
  ApiGetHardwareOptionsSwagger,
  ApiFindByIdHardwareSwagger,
  ApiCreateHardwareSwagger,
  ApiUpdateHardwareSwagger,
  ApiToggleHardwareStatusSwagger,
} from '../docs/hardware.swagger';
import { CreateHardwareRequestDto } from '../dtos/create-hardware.request.dto';
import { UpdateHardwareRequestDto } from '../dtos/update-hardware.request.dto';
import { FindAllHardwareQueryDto } from '../dtos/find-all-hardware.query.dto';
import { HardwareMapper } from '../adapters/persistence/mappers/hardware.mapper';

@ApiHardwareTag()
@Controller('hardware')
export class HardwareController {
  constructor(
    private readonly findAllHardwareUseCase: FindAllHardwareUseCase,
    private readonly findByIdHardwareUseCase: FindByIdHardwareUseCase,
    private readonly getHardwareUseCase: GetHardwareUseCase,
    private readonly createHardwareUseCase: CreateHardwareUseCase,
    private readonly updateHardwareUseCase: UpdateHardwareUseCase,
    private readonly toggleHardwareStatusUseCase: ToggleHardwareStatusUseCase,
  ) {}

  @Get()
  @ApiFindAllHardwareSwagger()
  async findAll(@Query() query: FindAllHardwareQueryDto) {
    const { data, meta } = await this.findAllHardwareUseCase.execute(query);

    // El ResponseInterceptor solo conserva `message` y `data`, por eso la
    // paginación viaja dentro de `data` (igual que en equipos y clientes).
    return {
      message: 'Hardware obtenidos exitosamente',
      data: { data: data.map(HardwareMapper.toResponse), meta },
    };
  }

  @Get('options')
  @ApiGetHardwareOptionsSwagger()
  async getHardwareOptions() {
    const data = await this.getHardwareUseCase.execute();
    return {
      message: 'Opciones de hardware obtenidas exitosamente',
      data,
    };
  }

  @Get(':id')
  @ApiFindByIdHardwareSwagger()
  async findById(@Param('id', ParseIntPipe) id: number) {
    const hardware = await this.findByIdHardwareUseCase.execute(id);
    return {
      message: 'Hardware obtenido exitosamente',
      data: hardware ? HardwareMapper.toResponse(hardware) : null,
    };
  }

  @Post()
  @ApiCreateHardwareSwagger()
  async create(@Body() dto: CreateHardwareRequestDto) {
    const hardware = await this.createHardwareUseCase.execute(dto);
    return {
      message: 'Hardware registrado exitosamente',
      data: HardwareMapper.toResponse(hardware),
    };
  }

  @Patch(':id')
  @ApiUpdateHardwareSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHardwareRequestDto,
  ) {
    await this.updateHardwareUseCase.execute(id, dto);
    return {
      message: 'Hardware actualizado exitosamente',
      data: null,
    };
  }

  @Patch(':id/toggle-status')
  @ApiToggleHardwareStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const message = await this.toggleHardwareStatusUseCase.execute(id);
    return { message, data: null };
  }
}
