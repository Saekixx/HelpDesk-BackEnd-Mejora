import { CreateSoftwareUseCase } from '@/software/application/use-cases/create-software.usecase';
import { FindAllSoftwareUseCase } from '@/software/application/use-cases/find-all-software.usecase';
import { FindByIdSoftwareUseCase } from '@/software/application/use-cases/find-by-id-software.usecase';
import { GetSoftwareUseCase } from '@/software/application/use-cases/get-software.usecase';
import { ToggleSoftwareStatusUseCase } from '@/software/application/use-cases/toggle-software-status.usecase';
import { UpdateSoftwareUseCase } from '@/software/application/use-cases/update-software.usecase';
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
import {
  ApiSoftwareTag,
  ApiFindAllSoftwareSwagger,
  ApiGetSoftwareOptionsSwagger,
  ApiFindByIdSoftwareSwagger,
  ApiCreateSoftwareSwagger,
  ApiUpdateSoftwareSwagger,
  ApiToggleSoftwareStatusSwagger,
} from '../docs/software.swagger';
import { CreateSoftwareRequestDto } from '../dtos/create-software.request.dto';
import { UpdateSoftwareRequestDto } from '../dtos/update-software.request.dto';
import { FindAllSoftwareQueryDto } from '../dtos/find-all-software.query.dto';

@ApiSoftwareTag()
@Controller('software')
export class SoftwareController {
  constructor(
    private readonly findAllSoftwareUseCase: FindAllSoftwareUseCase,
    private readonly findByIdSoftwareUseCase: FindByIdSoftwareUseCase,
    private readonly getSoftwareUseCase: GetSoftwareUseCase,
    private readonly createSoftwareUseCase: CreateSoftwareUseCase,
    private readonly updateSoftwareUseCase: UpdateSoftwareUseCase,
    private readonly toggleSoftwareStatusUseCase: ToggleSoftwareStatusUseCase,
  ) {}

  @Get()
  @ApiFindAllSoftwareSwagger()
  async findAll(@Query() query: FindAllSoftwareQueryDto) {
    const result = await this.findAllSoftwareUseCase.execute(query);

    return {
      message: 'Software obtenidos exitosamente',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get('options')
  @ApiGetSoftwareOptionsSwagger()
  async getSoftwareOptions() {
    const data = await this.getSoftwareUseCase.execute();
    return {
      message: 'Opciones de software obtenidas exitosamente',
      data,
    };
  }

  @Get(':id')
  @ApiFindByIdSoftwareSwagger()
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.findByIdSoftwareUseCase.execute(id);
    return {
      message: 'Software obtenido exitosamente',
      data,
    };
  }

  @Post('create')
  @ApiCreateSoftwareSwagger()
  async create(@Body() dto: CreateSoftwareRequestDto) {
    await this.createSoftwareUseCase.execute(dto);
    return {
      message: 'Software registrado exitosamente',
    };
  }

  @Patch(':id')
  @ApiUpdateSoftwareSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSoftwareRequestDto,
  ) {
    await this.updateSoftwareUseCase.execute(id, dto);
    return {
      message: 'Software actualizado exitosamente',
    };
  }

  @Patch(':id/status')
  @ApiToggleSoftwareStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const message = await this.toggleSoftwareStatusUseCase.execute(id);
    return { message };
  }
}