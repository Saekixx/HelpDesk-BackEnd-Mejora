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
import { GetEquiposUseCase } from '@/equipos/application/use-cases/get-equipos.use-case';
import { GetEquipoByIdUseCase } from '@/equipos/application/use-cases/get-equipo-by-id.use-case';
import { CreateEquipoUseCase } from '@/equipos/application/use-cases/create-equipo.use-case';
import { ToggleStatusEquipoUseCase } from '@/equipos/application/use-cases/toggle-status-equipo.use-case';
import { LiberarEquipoUseCase } from '@/equipos/application/use-cases/liberar-equipo.use-case';
import { AsignarEquipoUseCase } from '@/equipos/application/use-cases/asignar-equipo.use-case';
import { AgregarComponenteEquipoUseCase } from '@/equipos/application/use-cases/agregar-componente-equipo.use-case';
import { ReemplazarComponenteEquipoUseCase } from '@/equipos/application/use-cases/reemplazar-componente-equipo.use-case';
import { GetEquiposQueryDto } from '../dtos/get-equipos-query.dto';
import { GetEquipoOptionsQueryDto } from '../dtos/get-equipo-options-query.dto';
import { CreateEquipoHttpDto } from '../dtos/create-equipo-http.dto';
import { AsignarEquipoHttpDto } from '../dtos/asignar-equipo-http.dto';
import { AgregarComponenteHttpDto } from '../dtos/agregar-componente-http.dto';
import { ReemplazarComponenteHttpDto } from '../dtos/reemplazar-componente-http.dto';
import {
  JwtAuthGuard,
  JwtPayload,
} from '@/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/infrastructure/decorators/current-user.decorator';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  ApiFindAllEquiposSwagger,
  ApiFindEquipoByIdSwagger,
  ApiCreateEquipoSwagger,
  ApiToggleEquipoStatusSwagger,
  ApiLiberarEquipoSwagger,
  ApiAsignarEquipoSwagger,
  ApiAgregarComponenteEquipoSwagger,
  ApiReemplazarComponenteEquipoSwagger,
  ApiGetEquipoOptionsSwagger,
  ApiGetEquipoEstadisticasSwagger,
} from '../docs/equipo.swagger';
import { GetEquipoOptionsUseCase } from '@/equipos/application/use-cases/get-equipo-options.use-case';
import { GetEquipoEstadisticasUseCase } from '@/equipos/application/use-cases/get-equipo-estadisticas.use-case';

@ApiTags('Equipos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('equipos')
export class EquipoController {
  constructor(
    private readonly getEquiposUseCase: GetEquiposUseCase,
    private readonly getEquipoByIdUseCase: GetEquipoByIdUseCase,
    private readonly getEquipoOptionsUseCase: GetEquipoOptionsUseCase,
    private readonly getEquipoEstadisticasUseCase: GetEquipoEstadisticasUseCase,
    private readonly createEquipoUseCase: CreateEquipoUseCase,
    private readonly toggleStatusEquipoUseCase: ToggleStatusEquipoUseCase,
    private readonly liberarEquipoUseCase: LiberarEquipoUseCase,
    private readonly asignarEquipoUseCase: AsignarEquipoUseCase,
    private readonly agregarComponenteEquipoUseCase: AgregarComponenteEquipoUseCase,
    private readonly reemplazarComponenteEquipoUseCase: ReemplazarComponenteEquipoUseCase,
  ) {}

  @Get()
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindAllEquiposSwagger()
  async findAll(@Query() query: GetEquiposQueryDto) {
    const { data, ...meta } = await this.getEquiposUseCase.execute(query);
    return {
      message: 'Equipos obtenidos exitosamente',
      data: { data, meta },
    };
  }

  // Debe declararse antes de `@Get(':id')`; si no, "options" se interpretaría
  // como un id.
  @Get('options')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetEquipoOptionsSwagger()
  async getEquipoOptions(@Query() query: GetEquipoOptionsQueryDto) {
    const data = await this.getEquipoOptionsUseCase.execute(query);
    return { message: 'Opciones de equipos obtenidas exitosamente', data };
  }

  // Debe declararse antes de `@Get(':id')`; si no, "estadisticas" se
  // interpretaría como un id y `ParseIntPipe` respondería 400.
  @Get('estadisticas')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetEquipoEstadisticasSwagger()
  async getEstadisticas() {
    const data = await this.getEquipoEstadisticasUseCase.execute();
    return {
      message: 'Estadísticas del inventario de equipos obtenidas exitosamente',
      data,
    };
  }

  @Get(':id')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindEquipoByIdSwagger()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.getEquipoByIdUseCase.execute(id, user);
    return { message: 'Equipo obtenido exitosamente', data };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiCreateEquipoSwagger()
  async create(@Body() dto: CreateEquipoHttpDto) {
    const data = await this.createEquipoUseCase.execute(dto);
    return { message: 'Equipo creado exitosamente', data };
  }

  @Patch(':id/toggle-status')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiToggleEquipoStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleStatusEquipoUseCase.execute(id);
    return { message: 'Estado del equipo actualizado exitosamente', data };
  }

  @Patch(':id/liberar')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_TECNICO, RolEnum.SOPORTE_INSITU)
  @ApiLiberarEquipoSwagger()
  async liberar(@Param('id', ParseIntPipe) id: number) {
    await this.liberarEquipoUseCase.execute(id);
    return { message: 'Equipo liberado exitosamente', data: null };
  }

  @Patch(':id/asignar')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_TECNICO, RolEnum.SOPORTE_INSITU)
  @ApiAsignarEquipoSwagger()
  async asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarEquipoHttpDto,
  ) {
    await this.asignarEquipoUseCase.execute(id, dto);
    return { message: 'Equipo asignado exitosamente', data: null };
  }

  @Post(':id/componentes')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiAgregarComponenteEquipoSwagger()
  async agregarComponente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarComponenteHttpDto,
  ) {
    const data = await this.agregarComponenteEquipoUseCase.execute(id, dto);
    return { message: 'Componente agregado exitosamente', data };
  }

  @Post(':id/componentes/reemplazar')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiReemplazarComponenteEquipoSwagger()
  async reemplazarComponente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReemplazarComponenteHttpDto,
  ) {
    const data = await this.reemplazarComponenteEquipoUseCase.execute(id, dto);
    return { message: 'Componente reemplazado exitosamente', data };
  }
}
