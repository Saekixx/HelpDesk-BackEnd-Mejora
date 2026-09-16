import { CreateHardwareUseCase } from "@/hardware/application/use-cases/create-hardware.usecase";
import { FindAllHardwareUseCase } from "@/hardware/application/use-cases/find-all-hardware.usecase";
import { FindByIdHardwareUseCase } from "@/hardware/application/use-cases/find-by-id-hardware.usecase";
import { ToggleHardwareStatusUseCase } from "@/hardware/application/use-cases/toggle-hardware-status.usecase";
import { UpdateHardwareUseCase } from "@/hardware/application/use-cases/update-hardware.usecase";
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiHardwareTag,
  ApiFindAllHardwareSwagger,
  ApiFindByIdHardwareSwagger,
  ApiCreateHardwareSwagger,
  ApiUpdateHardwareSwagger,
  ApiToggleHardwareSwagger,
} from '../docs/hardware.swagger';

import { CreateHardwareRequestDto } from '../dtos/create-hardware.request.dto';
import { UpdateHardwareRequestDto } from '../dtos/update-hardware.request.dto';

@ApiHardwareTag()
@Controller('hardware')
export class HardwareController {
  constructor(
    private readonly findAllHardwareUseCase: FindAllHardwareUseCase,
    private readonly findByIdHardwareUseCase: FindByIdHardwareUseCase,
    private readonly createHardwareUseCase: CreateHardwareUseCase,
    private readonly updateHardwareUseCase: UpdateHardwareUseCase,
    private readonly toggleHardwareStatusUseCase: ToggleHardwareStatusUseCase,
  ) {}

  @Get()
  @ApiFindAllHardwareSwagger()
  async findAll() {
    const data = await this.findAllHardwareUseCase.execute();
    return {
      message: 'Hardwares obtenidos exitosamente',
      data,
    };
  }

  @Get(':id')
  @ApiFindByIdHardwareSwagger()
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.findByIdHardwareUseCase.execute(id);

    if (!data) {
      throw new NotFoundException(`El hardware con ID ${id} no existe`);
    }

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
      message: 'Hardware creado exitosamente',
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
      message: 'Hardware actualizado correctamente',
      data,
    };
  }

  @Patch(':id/status')
  @ApiToggleHardwareSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleHardwareStatusUseCase.execute(id);
    return {
      message: 'Estado de hardware actualizado correctamente',
      data,
    };
  }
}