import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetEquiposUseCase } from '@/equipos/application/use-cases/get-equipos.use-case';
import { GetEquipoByIdUseCase } from '@/equipos/application/use-cases/get-equipo-by-id.use-case';
import { CreateEquipoUseCase } from '@/equipos/application/use-cases/create-equipo.use-case';
import { UpdateEquipoUseCase } from '@/equipos/application/use-cases/update-equipo.use-case';
import { ToggleStatusEquipoUseCase } from '@/equipos/application/use-cases/toggle-status-equipo.use-case';
import { AgregarComponenteEquipoUseCase } from '@/equipos/application/use-cases/agregar-componente-equipo.use-case';
import { ReemplazarComponenteEquipoUseCase } from '@/equipos/application/use-cases/reemplazar-componente-equipo.use-case';
import { GetEquiposQueryDto } from '../dtos/get-equipos-query.dto';
import { CreateEquipoHttpDto } from '../dtos/create-equipo-http.dto';
import { UpdateEquipoHttpDto } from '../dtos/update-equipo-http.dto';
import { AgregarComponenteHttpDto } from '../dtos/agregar-componente-http.dto';
import { ReemplazarComponenteHttpDto } from '../dtos/reemplazar-componente-http.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  ApiFindAllEquiposSwagger,
  ApiFindEquipoByIdSwagger,
  ApiCreateEquipoSwagger,
  ApiUpdateEquipoSwagger,
  ApiToggleEquipoStatusSwagger,
  ApiAgregarComponenteEquipoSwagger,
  ApiReemplazarComponenteEquipoSwagger,
} from '../docs/equipo.swagger';

@ApiTags('Equipos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('equipos')
export class EquipoController {
  constructor(
    private readonly getEquiposUseCase: GetEquiposUseCase,
    private readonly getEquipoByIdUseCase: GetEquipoByIdUseCase,
    private readonly createEquipoUseCase: CreateEquipoUseCase,
    private readonly updateEquipoUseCase: UpdateEquipoUseCase,
    private readonly toggleStatusEquipoUseCase: ToggleStatusEquipoUseCase,
    private readonly agregarComponenteEquipoUseCase: AgregarComponenteEquipoUseCase,
    private readonly reemplazarComponenteEquipoUseCase: ReemplazarComponenteEquipoUseCase,
  ) {}

  @Get()
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_REMOTO)
  @ApiFindAllEquiposSwagger()
  async findAll(@Query() query: GetEquiposQueryDto) {
    const { data, ...meta } = await this.getEquiposUseCase.execute(query);
    return {
      message: 'Equipos obtenidos exitosamente',
      data: { data, meta },
    };
  }

  @Get(':id')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_REMOTO)
  @ApiFindEquipoByIdSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getEquipoByIdUseCase.execute(id);
    return { message: 'Equipo obtenido exitosamente', data };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiCreateEquipoSwagger()
  async create(@Body() dto: CreateEquipoHttpDto) {
    const data = await this.createEquipoUseCase.execute(dto);
    return { message: 'Equipo creado exitosamente', data };
  }

  @Put(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiUpdateEquipoSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipoHttpDto,
  ) {
    const data = await this.updateEquipoUseCase.execute(id, dto);
    return { message: 'Equipo actualizado exitosamente', data };
  }

  @Patch(':id/toggle-status')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiToggleEquipoStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleStatusEquipoUseCase.execute(id);
    return { message: 'Estado del equipo actualizado exitosamente', data };
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
