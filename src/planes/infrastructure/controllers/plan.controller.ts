import { CreatePlanUseCase } from '@/planes/application/use-cases/create-plan.usecase';
import { FindAllPlanesUseCase } from '@/planes/application/use-cases/find-all-planes.usecase';
import { FindByIdPlanesUseCase } from '@/planes/application/use-cases/find-by-id-plan.usecase';
import { TogglePlanStatusUseCase } from '@/planes/application/use-cases/toggle-plan-status.use-case';
import { UpdatePlanUseCase } from '@/planes/application/use-cases/update-plan.usecase';
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
  ApiPlanesTag,
  ApiFindAllPlanesSwagger,
  ApiFindByIdPlanSwagger,
  ApiCreatePlanSwagger,
  ApiUpdatePlanSwagger,
  ApiTogglePlanStatusSwagger,
} from '../docs/planes.swagger';
import { CreatePlanRequestDto } from '../dtos/create-plan.request.dto';
import { UpdatePlanRequestDto } from '../dtos/update-plan.request.dto';

@ApiPlanesTag()
@Controller('planes')
export class PlanController {
  constructor(
    private readonly findAllPlanesUseCase: FindAllPlanesUseCase,
    private readonly findByIdPlanesUseCase: FindByIdPlanesUseCase,
    private readonly createPlanUseCase: CreatePlanUseCase,
    private readonly updatePlanUseCase: UpdatePlanUseCase,
    private readonly togglePlanStatusUseCase: TogglePlanStatusUseCase,
  ) {}

  @Get()
  @ApiFindAllPlanesSwagger()
  async findAll() {
    const data = await this.findAllPlanesUseCase.execute();
    return {
      message: 'Planes obtenidos exitosamente',
      data,
    };
  }

  @Get(':id')
  @ApiFindByIdPlanSwagger()
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.findByIdPlanesUseCase.execute(id);
    return {
      message: 'Plan obtenido exitosamente',
      data,
    };
  }

  @Post('create')
  @ApiCreatePlanSwagger()
  async create(@Body() dto: CreatePlanRequestDto) {
    const data = await this.createPlanUseCase.execute(dto);
    return {
      message: 'Plan creado exitosamente',
      data,
    };
  }

  @Patch(':id')
  @ApiUpdatePlanSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanRequestDto,
  ) {
    const data = await this.updatePlanUseCase.execute(id, dto);
    return {
      message: 'Plan actualizado exitosamente',
      data,
    };
  }

  @Patch(':id/status')
  @ApiTogglePlanStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.togglePlanStatusUseCase.execute(id);
  }
}
