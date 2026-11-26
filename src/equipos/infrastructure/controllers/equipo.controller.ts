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
import { CambiarEstadoEquipoUseCase } from '@/equipos/application/use-cases/cambiar-estado-equipo.use-case';
import { LiberarEquipoUseCase } from '@/equipos/application/use-cases/liberar-equipo.use-case';
import { AsignarEquipoUseCase } from '@/equipos/application/use-cases/asignar-equipo.use-case';
import { MontarComponenteStockUseCase } from '@/equipos/application/use-cases/montar-componente-stock.use-case';
import { RegistrarEInstalarComponenteUseCase } from '@/equipos/application/use-cases/registrar-e-instalar-componente.use-case';
import { ReemplazarComponenteStockUseCase } from '@/equipos/application/use-cases/reemplazar-componente-stock.use-case';
import { RegistrarEReemplazarComponenteUseCase } from '@/equipos/application/use-cases/registrar-e-reemplazar-componente.use-case';
import { GetEquiposQueryDto } from '../dtos/get-equipos-query.dto';
import { GetEquipoOptionsQueryDto } from '../dtos/get-equipo-options-query.dto';
import { CreateEquipoHttpDto } from '../dtos/create-equipo-http.dto';
import { AsignarEquipoHttpDto } from '../dtos/asignar-equipo-http.dto';
import { MontarComponenteStockHttpDto } from '../dtos/montar-componente-stock-http.dto';
import { RegistrarInstalarComponenteHttpDto } from '../dtos/registrar-instalar-componente-http.dto';
import { ReemplazarComponenteStockHttpDto } from '../dtos/reemplazar-componente-stock-http.dto';
import { RegistrarReemplazarComponenteHttpDto } from '../dtos/registrar-reemplazar-componente-http.dto';
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
  ApiCambiarEstadoEquipoSwagger,
  ApiLiberarEquipoSwagger,
  ApiAsignarEquipoSwagger,
  ApiMontarComponenteStockSwagger,
  ApiRegistrarEInstalarComponenteSwagger,
  ApiReemplazarComponenteStockSwagger,
  ApiRegistrarEReemplazarComponenteSwagger,
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
    private readonly cambiarEstadoEquipoUseCase: CambiarEstadoEquipoUseCase,
    private readonly liberarEquipoUseCase: LiberarEquipoUseCase,
    private readonly asignarEquipoUseCase: AsignarEquipoUseCase,
    private readonly montarComponenteStockUseCase: MontarComponenteStockUseCase,
    private readonly registrarEInstalarComponenteUseCase: RegistrarEInstalarComponenteUseCase,
    private readonly reemplazarComponenteStockUseCase: ReemplazarComponenteStockUseCase,
    private readonly registrarEReemplazarComponenteUseCase: RegistrarEReemplazarComponenteUseCase,
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

<<<<<<< HEAD
  @Get('/options')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_TECNICO,
    RolEnum.CLIENTE_TRABAJADOR,
  )
  @ApiGetEquipoOptionsSwagger()
  async getEquipoOptions(
    @Query('id_area') id_area?: number | undefined,
    @Query('id_trabajador') id_trabajador?: number | undefined,
  ) {
    const data = await this.getEquipoOptionsUseCase.execute(
      id_area ? Number(id_area) : undefined,
      id_trabajador ? Number(id_trabajador) : undefined,
    );
=======
  // Debe declararse antes de `@Get(':id')`; si no, "options" se interpretaría
  // como un id.
  @Get('options')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetEquipoOptionsSwagger()
  async getEquipoOptions(@Query() query: GetEquipoOptionsQueryDto) {
    const data = await this.getEquipoOptionsUseCase.execute(query);
>>>>>>> origin/giovanni
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

  @Patch(':id/estado')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_TECNICO, RolEnum.SOPORTE_INSITU)
  @ApiCambiarEstadoEquipoSwagger()
  async cambiarEstado(@Param('id', ParseIntPipe) id: number) {
    const data = await this.cambiarEstadoEquipoUseCase.execute(id);
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

  // El técnico responsable del movimiento es el usuario autenticado que
  // realiza la instalación (no se acepta en el body).
  @Post(':id/componentes/montar-stock')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_TECNICO, RolEnum.SOPORTE_INSITU)
  @ApiMontarComponenteStockSwagger()
  async montarComponenteStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MontarComponenteStockHttpDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.montarComponenteStockUseCase.execute(id, dto, user.sub);
    return { message: 'Componente montado exitosamente', data: null };
  }

  @Post(':id/componentes/registrar-instalar')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_TECNICO, RolEnum.SOPORTE_INSITU)
  @ApiRegistrarEInstalarComponenteSwagger()
  async registrarEInstalarComponente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarInstalarComponenteHttpDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.registrarEInstalarComponenteUseCase.execute(id, dto, user.sub);
    return {
      message: 'Componente registrado e instalado exitosamente',
      data: null,
    };
  }

  // El técnico responsable del movimiento es el usuario autenticado que
  // realiza el reemplazo (no se acepta en el body). `idHardwareActual` es el
  // componente que sale del equipo.
  @Post(':id/componentes/:idHardwareActual/reemplazar-stock')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_TECNICO, RolEnum.SOPORTE_INSITU)
  @ApiReemplazarComponenteStockSwagger()
  async reemplazarComponenteStock(
    @Param('id', ParseIntPipe) id: number,
    @Param('idHardwareActual', ParseIntPipe) idHardwareActual: number,
    @Body() dto: ReemplazarComponenteStockHttpDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.reemplazarComponenteStockUseCase.execute(
      id,
      idHardwareActual,
      dto,
      user.sub,
    );
    return { message: 'Componente reemplazado exitosamente', data: null };
  }

  @Post(':id/componentes/:idHardwareActual/registrar-reemplazar')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_TECNICO, RolEnum.SOPORTE_INSITU)
  @ApiRegistrarEReemplazarComponenteSwagger()
  async registrarEReemplazarComponente(
    @Param('id', ParseIntPipe) id: number,
    @Param('idHardwareActual', ParseIntPipe) idHardwareActual: number,
    @Body() dto: RegistrarReemplazarComponenteHttpDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.registrarEReemplazarComponenteUseCase.execute(
      id,
      idHardwareActual,
      dto,
      user.sub,
    );
    return {
      message: 'Componente registrado y reemplazado exitosamente',
      data: null,
    };
  }
}
