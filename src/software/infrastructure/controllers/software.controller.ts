import { CreateSoftwareUseCase } from '@/software/application/use-cases/create-software.usecase';
import { FindAllSoftwareUseCase } from '@/software/application/use-cases/find-all-software.usecase';
import { FindByIdSoftwareUseCase } from '@/software/application/use-cases/find-by-id-software.usecase';
import { GetSoftwareUseCase } from '@/software/application/use-cases/get-software.usecase';
import { ToggleSoftwareStatusUseCase } from '@/software/application/use-cases/toggle-software-status.usecase';
import { UpdateSoftwareUseCase } from '@/software/application/use-cases/update-software.usecase';
import { AssignEquipmentUseCase } from '@/software/application/use-cases/assign-equipment.usecase';
import { ReleaseEquipmentUseCase } from '@/software/application/use-cases/release-equipment.usecase';
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
  ApiAssignEquipmentSwagger,
  ApiReleaseEquipmentSwagger,
  ApiFindSoftwareVaultSwagger,
} from '../docs/software.swagger';
import { CreateSoftwareRequestDto } from '../dtos/create-software.request.dto';
import { UpdateSoftwareRequestDto } from '../dtos/update-software.request.dto';
import { FindAllSoftwareQueryDto } from '../dtos/find-all-software.query.dto';
import { AssignSoftwareEquipmentDto } from '../../application/dtos/assign-software-equipment.dto';
import { FindByIdSoftwareEquipoUseCase } from '@/software/application/use-cases/get-software-equipos.usecase';

@ApiSoftwareTag()
@Controller('software')
export class SoftwareController {
  constructor(
    private readonly findAllSoftwareUseCase: FindAllSoftwareUseCase,
    private readonly findByIdSoftwareUseCase: FindByIdSoftwareUseCase,
    private readonly findByIdSoftwareEquipoUseCase: FindByIdSoftwareEquipoUseCase,
    private readonly getSoftwareUseCase: GetSoftwareUseCase,
    private readonly createSoftwareUseCase: CreateSoftwareUseCase,
    private readonly updateSoftwareUseCase: UpdateSoftwareUseCase,
    private readonly toggleSoftwareStatusUseCase: ToggleSoftwareStatusUseCase,
    private readonly assignEquipmentUseCase: AssignEquipmentUseCase,
    private readonly releaseEquipmentUseCase: ReleaseEquipmentUseCase,
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

  @Post(':id/assign')
  @ApiAssignEquipmentSwagger()
  async assignEquipment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignSoftwareEquipmentDto,
  ) {
    await this.assignEquipmentUseCase.execute(id, dto);
    return {
      message: 'Equipo asignado exitosamente al software',
    };
  }

  @Patch('equipment/:idAssignment/release')
  @ApiReleaseEquipmentSwagger()
  async releaseEquipment(
    @Param('idAssignment', ParseIntPipe) idAssignment: number,
  ) {
    await this.releaseEquipmentUseCase.execute(idAssignment);
    return {
      message: 'Equipo liberado exitosamente',
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

  @Get(':id/boveda')
  @ApiFindSoftwareVaultSwagger()
  async getSoftwareVault(@Param('id') id: string) {
    const data = await this.findByIdSoftwareEquipoUseCase.execute(Number(id));
    return {
      status: 200,
      message: 'Bóveda de software obtenida exitosamente',
      data,
    };
  }
}
