import { CreateSoftLockUseCase } from '@/citas/application/use-case/softlock/create-soft-lock.use-case';
import { GetAvailableSlotsUseCase } from '@/citas/application/use-case/softlock/get-available-slots.use-case';
import { AutoAssignInsituUseCase } from '@/citas/application/use-case/citas/auto-assign-insitu.use-case';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AutoAssignQueryDto } from '../dto/auto-assign-query.dto';
import {
  ApiGetAvailableSlotsSwagger,
  ApiCreateSoftLockSwagger,
} from '../docs/soft-lock.swagger';
import { ApiAutoAssignInsituSwagger } from '../docs/auto-assign.swagger';
import { CreateSoftLockDto } from '../dto/create-softlock.dto';

@Controller('soft-lock')
export class SoftLockController {
  constructor(
    private readonly createSoftLockUseCase: CreateSoftLockUseCase,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly autoAssignInsituUseCase: AutoAssignInsituUseCase,
  ) {}

  @Get('auto-asignar')
  @ApiAutoAssignInsituSwagger()
  async autoAsignarInsitu(@Query() query: AutoAssignQueryDto) {
    return await this.autoAssignInsituUseCase.execute({
      id_sucursal: query.id_sucursal,
      fecha: query.fecha,
    });
  }

  @Get('disponibilidad')
  @ApiGetAvailableSlotsSwagger()
  async obtenerDisponibilidad(
    @Query('id_tecnico') idTecnico: string,
    @Query('fecha') fecha: string,
    @Query('id_sucursal') idSucursal: string,
  ) {
    return await this.getAvailableSlotsUseCase.execute(
      Number(idTecnico),
      fecha,
      Number(idSucursal),
    );
  }

  @Post()
  @ApiCreateSoftLockSwagger()
  async crearSoftLock(@Body() dto: CreateSoftLockDto) {
    return await this.createSoftLockUseCase.execute(dto);
  }
}
