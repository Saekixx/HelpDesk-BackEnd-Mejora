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
import { GetSucursalesOptionsUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursales-options.use-case';
import { GetSucursalesUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursales.use-case';
import { GetSucursalByIdUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursal-by-id.use-case';
import { CreateSucursalUseCase } from '@/clientes/application/use-cases/sucursal/create-sucursal.use-case';
import { UpdateSucursalUseCase } from '@/clientes/application/use-cases/sucursal/update-sucursal.use-case';
import { ToggleSucursalStatusUseCase } from '@/clientes/application/use-cases/sucursal/toggle-sucursal-status.use-case';
import { GetSucursalesQueryDto } from '../dtos/get-sucursales-query.dto';
import { CreateSucursalHttpDto } from '../dtos/create-sucursal-http.dto';
import { UpdateSucursalHttpDto } from '../dtos/update-sucursal-http.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';

@ApiTags('Sucursales')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('sucursales')
export class SucursalController {
  constructor(
    private readonly getSucursalesOptionsUseCase: GetSucursalesOptionsUseCase,
    private readonly getSucursalesUseCase: GetSucursalesUseCase,
    private readonly getSucursalByIdUseCase: GetSucursalByIdUseCase,
    private readonly createSucursalUseCase: CreateSucursalUseCase,
    private readonly updateSucursalUseCase: UpdateSucursalUseCase,
    private readonly toggleSucursalStatusUseCase: ToggleSucursalStatusUseCase,
  ) {}

  @Get()
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiOperation({
    summary: 'Listar sucursales',
    description:
      'Retorna un listado paginado de sucursales, con filtro opcional por cliente, texto de búsqueda y estado activo/inactivo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sucursales obtenidas exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso de lectura.',
  })
  async findAll(@Query() query: GetSucursalesQueryDto) {
    const data = await this.getSucursalesUseCase.execute(query);
    return {
      message: 'Sucursales obtenidas exitosamente',
      data,
    };
  }

  // Endpoint preexistente: ':id' aquí representa el id_cliente (empresa),
  // no el id_sucursal, ya que lista las sucursales de un cliente para
  // poblar selects/options en el frontend.
  @Get(':id/options')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiOperation({
    summary: 'Listar sucursales de un cliente en formato opción',
    description:
      'Retorna un listado reducido (id, nombre) de las sucursales del cliente indicado, pensado para poblar selects en el frontend.',
  })
  @ApiResponse({
    status: 200,
    description: 'Opciones de sucursal obtenidas exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso de lectura.',
  })
  async getSucursalesOptions(@Param('id', ParseIntPipe) id: number) {
    return await this.getSucursalesOptionsUseCase.execute(id);
  }

  @Get(':id')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiOperation({ summary: 'Obtener una sucursal por id' })
  @ApiResponse({
    status: 200,
    description: 'Sucursal obtenida exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso de lectura.',
  })
  @ApiResponse({ status: 404, description: 'La sucursal no existe.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getSucursalByIdUseCase.execute(id);
    return {
      message: 'Sucursal obtenida exitosamente',
      data,
    };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Crear una sucursal',
    description:
      'Crea una sucursal asociada a un cliente (empresa) existente.',
  })
  @ApiResponse({ status: 201, description: 'Sucursal creada exitosamente.' })
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
    description: 'El cliente (empresa) indicado no existe.',
  })
  async create(@Body() dto: CreateSucursalHttpDto) {
    const data = await this.createSucursalUseCase.execute(dto);
    return {
      message: 'Sucursal creada exitosamente',
      data,
    };
  }

  @Patch(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una sucursal existente' })
  @ApiResponse({
    status: 200,
    description: 'Sucursal actualizada exitosamente.',
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
    description: 'La sucursal o el cliente indicado no existen.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSucursalHttpDto,
  ) {
    const data = await this.updateSucursalUseCase.execute(id, dto);
    return {
      message: 'Sucursal actualizada exitosamente',
      data,
    };
  }

  @Patch(':id/toggle-status')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Activar/desactivar una sucursal',
    description: 'Alterna el estado is_active de la sucursal (soft toggle).',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la sucursal actualizado exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado o ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'El rol del usuario no tiene permiso administrativo.',
  })
  @ApiResponse({ status: 404, description: 'La sucursal no existe.' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleSucursalStatusUseCase.execute(id);
    return {
      message: 'Estado de la sucursal actualizado exitosamente',
      data,
    };
  }
}