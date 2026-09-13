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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Listar áreas',
    description:
      'Retorna un listado paginado de áreas, con filtro opcional por cliente (a través de la sucursal), sucursal, texto de búsqueda y estado activo/inactivo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Áreas obtenidas exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso de lectura.',
  })
  async findAll(@Query() query: GetAreasQueryDto) {
    const data = await this.getAreasUseCase.execute(query);
    return {
      message: 'Áreas obtenidas exitosamente',
      data,
    };
  }

  // Endpoint preexistente: ':id' aquí representa el id_sucursal, no el
  // id_area, ya que lista las áreas de una sucursal para poblar
  // selects/options en el frontend. Al tener un segmento adicional
  // ('/options'), no colisiona con la ruta 'GET /areas/:id' de abajo.
  @Get(':id/options')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiOperation({
    summary: 'Listar áreas de una sucursal en formato opción',
    description:
      'Retorna un listado reducido (id, nombre) de las áreas de la sucursal indicada, pensado para poblar selects en el frontend.',
  })
  @ApiResponse({
    status: 200,
    description: 'Opciones de área obtenidas exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso de lectura.',
  })
  async getAreasOptions(@Param('id', ParseIntPipe) id: number) {
    return await this.getAreasOptionsUseCase.execute(id);
  }

  @Get(':id')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiOperation({ summary: 'Obtener un área por id' })
  @ApiResponse({
    status: 200,
    description: 'Área obtenida exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso de lectura.',
  })
  @ApiResponse({ status: 404, description: 'El área no existe.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getAreaByIdUseCase.execute(id);
    return {
      message: 'Área obtenida exitosamente',
      data,
    };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Crear un área',
    description: 'Crea un área asociada a una sucursal existente.',
  })
  @ApiResponse({ status: 201, description: 'Área creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso administrativo.',
  })
  @ApiResponse({
    status: 404,
    description: 'La sucursal indicada no existe.',
  })
  async create(@Body() dto: CreateAreaHttpDto) {
    const data = await this.createAreaUseCase.execute(dto);
    return {
      message: 'Área creada exitosamente',
      data,
    };
  }

  @Patch(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un área existente' })
  @ApiResponse({
    status: 200,
    description: 'Área actualizada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso administrativo.',
  })
  @ApiResponse({
    status: 404,
    description: 'El área o la sucursal indicada no existen.',
  })
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
  @ApiOperation({
    summary: 'Activar/desactivar un área',
    description: 'Alterna el estado is_active del área (soft toggle).',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del área actualizado exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso administrativo.',
  })
  @ApiResponse({ status: 404, description: 'El área no existe.' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleAreaStatusUseCase.execute(id);
    return {
      message: 'Estado del área actualizado exitosamente',
      data,
    };
  }
}