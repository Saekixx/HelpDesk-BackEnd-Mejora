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
import { CreateHardwareUseCase } from '@/hardware/application/use-cases/create-hardware.usecase';
import { FindAllHardwareUseCase } from '@/hardware/application/use-cases/find-all-hardware.usecase';
import { FindByIdHardwareUseCase } from '@/hardware/application/use-cases/find-by-id-hardware.usecase';
import { GetHardwareOptionsUseCase } from '@/hardware/application/use-cases/get-hardware-options.usecase';
import { GetHardwareStatsUseCase } from '@/hardware/application/use-cases/get-hardware-stats.usecase';
import { TransitionHardwareUseCase } from '@/hardware/application/use-cases/transition-hardware.usecase';
import { UpdateHardwareUseCase } from '@/hardware/application/use-cases/update-hardware.usecase';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '@/auth/infrastructure/decorators/current-user.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  ApiHardwareTag,
  ApiFindAllHardwareSwagger,
  ApiGetHardwareOptionsSwagger,
  ApiGetHardwareStatsSwagger,
  ApiFindByIdHardwareSwagger,
  ApiCreateHardwareSwagger,
  ApiUpdateHardwareSwagger,
  ApiTransitionHardwareSwagger,
} from '../docs/hardware.swagger';
import { CreateHardwareRequestDto } from '../dtos/create-hardware.request.dto';
import { UpdateHardwareRequestDto } from '../dtos/update-hardware.request.dto';
import { TransitionHardwareRequestDto } from '../dtos/transition-hardware.request.dto';
import { FindAllHardwareQueryDto } from '../dtos/find-all-hardware.query.dto';
import { FindHardwareOptionsQueryDto } from '../dtos/find-hardware-options.query.dto';
import { HardwareMapper } from '../adapters/persistence/mappers/hardware.mapper';

@ApiHardwareTag()
@Controller('hardware')
export class HardwareController {
  constructor(
    private readonly findAllHardwareUseCase: FindAllHardwareUseCase,
    private readonly findByIdHardwareUseCase: FindByIdHardwareUseCase,
    private readonly getHardwareOptionsUseCase: GetHardwareOptionsUseCase,
    private readonly getHardwareStatsUseCase: GetHardwareStatsUseCase,
    private readonly createHardwareUseCase: CreateHardwareUseCase,
    private readonly updateHardwareUseCase: UpdateHardwareUseCase,
    private readonly transitionHardwareUseCase: TransitionHardwareUseCase,
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
  async getHardwareOptions(@Query() query: FindHardwareOptionsQueryDto) {
    const data = await this.getHardwareOptionsUseCase.execute(query);
    return {
      message: 'Opciones de hardware obtenidas exitosamente',
      data,
    };
  }

  // Debe declararse antes de @Get(':id'); de lo contrario "estadisticas" se
  // interpretaría como un ID y ParseIntPipe respondería 400.
  @Get('estadisticas')
  @ApiGetHardwareStatsSwagger()
  async getEstadisticas() {
    const estadisticas = await this.getHardwareStatsUseCase.execute();
    return {
      message: 'Estadísticas de hardware obtenidas exitosamente',
      data: HardwareMapper.toStatsResponse(estadisticas),
    };
  }

  @Get(':id')
  @ApiFindByIdHardwareSwagger()
  async findById(@Param('id', ParseIntPipe) id: number) {
    const hardware = await this.findByIdHardwareUseCase.execute(id);
    return {
      message: 'Hardware obtenido exitosamente',
      data: HardwareMapper.toDetailResponse(hardware),
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
    const hardware = await this.updateHardwareUseCase.execute(id, dto);
    return {
      message: 'Hardware actualizado exitosamente',
      data: HardwareMapper.toUpdateResponse(hardware),
    };
  }

  // Requiere autenticación: el usuario del token queda como técnico
  // responsable en la hoja de vida del componente.
  @Patch(':id/transition')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiTransitionHardwareSwagger()
  async transition(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransitionHardwareRequestDto,
    @CurrentUser('userId') userId: number,
  ) {
    // El JWT firma `sub` como string (login/register), así que `userId` llega
    // como texto en tiempo de ejecución aunque el tipo diga number.
    const tecnicoId = userId ? Number(userId) : undefined;
    const hardware = await this.transitionHardwareUseCase.execute(
      id,
      dto,
      tecnicoId,
    );
    return {
      message: 'Estado del hardware actualizado exitosamente',
      data: HardwareMapper.toTransitionResponse(hardware),
    };
  }
}
