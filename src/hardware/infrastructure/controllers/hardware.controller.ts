import { CreateHardwareUseCase } from '@/hardware/application/use-cases/create-hardware.usecase';
import { FindAllHardwareUseCase } from '@/hardware/application/use-cases/find-all-hardware.usecase';
import { FindByIdHardwareUseCase } from '@/hardware/application/use-cases/find-by-id-hardware.usecase';
import { GetHardwareUseCase } from '@/hardware/application/use-cases/get-hardware.usecase';
import { ToggleHardwareStatusUseCase } from '@/hardware/application/use-cases/toggle-hardware-status.usecase';
import { UpdateHardwareUseCase } from '@/hardware/application/use-cases/update-hardware.usecase';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
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
  async findAll() {
    const data = await this.findAllHardwareUseCase.execute();
    return {
      message: 'Hardware obtenidos exitosamente',
      data,
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
    const data = await this.findByIdHardwareUseCase.execute(id);
    return {
      message: 'Hardware obtenido exitosamente',
      data,
    };
  }

  @Post('create')
  @ApiCreateHardwareSwagger()
  async create(@Body() dto: CreateHardwareRequestDto) {
    const data = await this.createHardwareUseCase.execute(dto);
    return {
      message: 'Hardware registrado exitosamente',
      data,
    };
  }

  @Patch(':id')
  @ApiUpdateHardwareSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHardwareRequestDto,
  ) {
    const data = await this.updateHardwareUseCase.execute(id, dto);
    return {
      message: 'Hardware actualizado exitosamente',
      data,
    };
  }

  @Patch(':id/status')
  @ApiToggleHardwareStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.toggleHardwareStatusUseCase.execute(id);
  }
}