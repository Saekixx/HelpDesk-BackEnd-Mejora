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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetAreasOptionsUseCase } from '@/clientes/application/use-cases/area/get-areas-options.use-case';
import { GetAreasUseCase } from '@/clientes/application/use-cases/area/get-areas.use-case';
import { GetAreaByIdUseCase } from '@/clientes/application/use-cases/area/get-area-by-id.use-case';
import { CreateAreaUseCase } from '@/clientes/application/use-cases/area/create-area.use-case';
import { UpdateAreaUseCase } from '@/clientes/application/use-cases/area/update-area.use-case';
import { ToggleAreaStatusUseCase } from '@/clientes/application/use-cases/area/toggle-area-status.use-case';
import { GetAreasQueryDto } from '../dtos/get-areas-query.dto';
import { CreateAreaHttpDto } from '../dtos/create-area-http.dto';
import { UpdateAreaHttpDto } from '../dtos/update-area-http.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  ApiFindAllAreasSwagger,
  ApiGetAreasOptionsSwagger,
  ApiFindAreaByIdSwagger,
  ApiCreateAreaSwagger,
  ApiUpdateAreaSwagger,
  ApiToggleAreaStatusSwagger,
} from '../docs/area.swagger';

@ApiTags('Areas')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('areas')
export class AreaController {
  constructor(
    private readonly getAreasOptionsUseCase: GetAreasOptionsUseCase,
    private readonly getAreasUseCase: GetAreasUseCase,
    private readonly getAreaByIdUseCase: GetAreaByIdUseCase,
    private readonly createAreaUseCase: CreateAreaUseCase,
    private readonly updateAreaUseCase: UpdateAreaUseCase,
    private readonly toggleAreaStatusUseCase: ToggleAreaStatusUseCase,
  ) {}

  @Get()
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiFindAllAreasSwagger()
  async findAll(@Query() query: GetAreasQueryDto) {
    const data = await this.getAreasUseCase.execute(query);
    return {
      message: 'Áreas obtenidas exitosamente',
      data,
    };
  }

  @Get(':id/options')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiGetAreasOptionsSwagger()
  async getAreasOptions(@Param('id', ParseIntPipe) id: number) {
    return await this.getAreasOptionsUseCase.execute(id);
  }

  @Get(':id')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiFindAreaByIdSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getAreaByIdUseCase.execute(id);
    return {
      message: 'Área obtenida exitosamente',
      data,
    };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiCreateAreaSwagger()
  async create(@Body() dto: CreateAreaHttpDto) {
    const data = await this.createAreaUseCase.execute(dto);
    return {
      message: 'Área creada exitosamente',
      data,
    };
  }

  @Patch(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiUpdateAreaSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreaHttpDto,
  ) {
    const data = await this.updateAreaUseCase.execute(id, dto);
    return {
      message: 'Área actualizada exitosamente',
      data,
    };
  }

  @Patch(':id/toggle-status')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiToggleAreaStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleAreaStatusUseCase.execute(id);
    return {
      message: 'Estado del área actualizado exitosamente',
      data,
    };
  }
}