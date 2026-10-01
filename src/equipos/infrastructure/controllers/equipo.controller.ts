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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { EquipoDetailResponseDto } from '../dtos/equipo-detail-response.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';

const EQUIPO_EJEMPLO = {
  id_equipo: 1,
  tipo: 'Laptop',
  marca: 'Dell',
  nombre_equipo: 'PC-Contabilidad-01',
  num_serie: 'SN-2026-00123',
  nombre_usuario: 'Carlos Ramírez',
  id_trabajador: 5,
  id_cliente: 1,
  id_sucursal: 1,
  id_area: 1,
  is_active: true,
};

// Relaciones resumidas que devuelven el listado, la creación y la edición.
const RELACIONES_EJEMPLO = {
  cliente: { id: 1, nombre: 'Acme Corp SAC' },
  sucursal: { id: 1, nombre: 'Sucursal Central' },
  area: { id: 1, nombre: 'Sistemas' },
  trabajador: { id: 5, nombre: 'Juan Pérez' },
};

const COMPONENTE_EJEMPLO = {
  id_RH: 12,
  tipo: 'Memoria RAM',
  marca: 'Kingston',
  descripcion: 'Ampliación de memoria RAM solicitada por el usuario',
  serie: 'SN-RAM-2026-00456',
  proveedor: 'Tecnoglobal S.A.C.',
  fecha_instalacion: '2026-09-29T15:30:00.000Z',
  url_factura: null,
  is_active: true,
};

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
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiOperation({
    summary: 'Listar equipos',
    description:
      'Retorna un listado paginado de equipos, con filtro opcional por cliente, sucursal, texto de búsqueda y estado activo/inactivo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipos obtenidos exitosamente.',
    schema: {
      example: {
        message: 'Equipos obtenidos exitosamente',
        data: {
          data: [
            {
              ...EQUIPO_EJEMPLO,
              ...RELACIONES_EJEMPLO,
            },
          ],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado o ausente.' })
  @ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso de lectura.' })
  async findAll(@Query() query: GetEquiposQueryDto) {
    const { data, ...meta } = await this.getEquiposUseCase.execute(query);
    return {
      message: 'Equipos obtenidos exitosamente',
      data: { data, meta },
    };
  }

  @Get(':id')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiOperation({
    summary: 'Obtener el detalle de un equipo por id',
    description:
      'Retorna el equipo con sus relaciones (cliente, sucursal, área, trabajador), los componentes de hardware separados en actuales e historial, y el software instalado. Alimenta la vista de detalle del equipo en el frontend.',
  })
  @ApiParam({ name: 'id', description: 'ID numérico del equipo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Equipo obtenido exitosamente.',
    type: EquipoDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado o ausente.' })
  @ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso de lectura.' })
  @ApiResponse({ status: 404, description: 'El equipo no existe.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getEquipoByIdUseCase.execute(id);
    return { message: 'Equipo obtenido exitosamente', data };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Registrar un equipo',
    description:
      'Registra un nuevo equipo, opcionalmente asociado a un cliente, sucursal, área y trabajador.',
  })
  @ApiResponse({
    status: 201,
    description: 'Equipo creado exitosamente.',
    schema: {
      example: {
        message: 'Equipo creado exitosamente',
        data: { ...EQUIPO_EJEMPLO, ...RELACIONES_EJEMPLO },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado o ausente.' })
  @ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso administrativo.' })
  @ApiResponse({ status: 409, description: 'Ya existe un equipo con ese número de serie.' })
  async create(@Body() dto: CreateEquipoHttpDto) {
    const data = await this.createEquipoUseCase.execute(dto);
    return { message: 'Equipo creado exitosamente', data };
  }

  @Put(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un equipo existente' })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del equipo a actualizar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Equipo actualizado exitosamente.',
    schema: {
      example: {
        message: 'Equipo actualizado exitosamente',
        data: { ...EQUIPO_EJEMPLO, ...RELACIONES_EJEMPLO },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado o ausente.' })
  @ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso administrativo.' })
  @ApiResponse({ status: 404, description: 'El equipo no existe.' })
  @ApiResponse({ status: 409, description: 'Ya existe un equipo con ese número de serie.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipoHttpDto,
  ) {
    const data = await this.updateEquipoUseCase.execute(id, dto);
    return { message: 'Equipo actualizado exitosamente', data };
  }

  @Patch(':id/toggle-status')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Activar/desactivar un equipo',
    description: 'Alterna el estado is_active del equipo (soft toggle).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del equipo a activar/desactivar',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del equipo actualizado exitosamente.',
    schema: {
      example: {
        message: 'Estado del equipo actualizado exitosamente',
        data: { ...EQUIPO_EJEMPLO, is_active: false },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido, expirado o ausente.' })
  @ApiResponse({ status: 403, description: 'El rol del usuario no tiene permiso administrativo.' })
  @ApiResponse({ status: 404, description: 'El equipo no existe.' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleStatusEquipoUseCase.execute(id);
    return { message: 'Estado del equipo actualizado exitosamente', data };
  }

  @Post(':id/componentes')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Agregar un componente de hardware a un equipo',
    description:
      'Asocia un componente de hardware existente al equipo y lo registra como componente actual en el historial de hardware, con la fecha de instalación en el momento de la solicitud.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del equipo al que se agrega el componente',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Componente agregado exitosamente.',
    schema: {
      example: {
        message: 'Componente agregado exitosamente',
        data: COMPONENTE_EJEMPLO,
      },
    },
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
    description: 'El equipo o el componente de hardware no existe.',
  })
  async agregarComponente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarComponenteHttpDto,
  ) {
    const data = await this.agregarComponenteEquipoUseCase.execute(id, dto);
    return { message: 'Componente agregado exitosamente', data };
  }

  @Post(':id/componentes/reemplazar')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Reemplazar un componente de hardware de un equipo',
    description:
      'Reemplaza de forma transaccional un componente actual del equipo: el registro saliente pasa al historial (is_actual = false) y se crea el nuevo componente como actual, con la fecha de instalación en el momento de la solicitud. Si algo falla, no se aplica ningún cambio.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID numérico del equipo cuyo componente se reemplaza',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: 'Componente reemplazado exitosamente.',
    schema: {
      example: {
        message: 'Componente reemplazado exitosamente',
        data: COMPONENTE_EJEMPLO,
      },
    },
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
    description:
      'El equipo o el hardware nuevo no existe, o el componente saliente no está instalado actualmente en el equipo.',
  })
  async reemplazarComponente(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReemplazarComponenteHttpDto,
  ) {
    const data = await this.reemplazarComponenteEquipoUseCase.execute(id, dto);
    return { message: 'Componente reemplazado exitosamente', data };
  }
}