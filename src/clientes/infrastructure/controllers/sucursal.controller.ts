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
import {
  ApiFindAllSucursalesSwagger,
  ApiGetSucursalesOptionsSwagger,
  ApiFindSucursalByIdSwagger,
  ApiCreateSucursalSwagger,
  ApiUpdateSucursalSwagger,
  ApiToggleSucursalStatusSwagger,
} from '../docs/sucursal.swagger';

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
  @ApiFindAllSucursalesSwagger()
  async findAll(@Query() query: GetSucursalesQueryDto) {
    const data = await this.getSucursalesUseCase.execute(query);
    return {
      message: 'Sucursales obtenidas exitosamente',
      data,
    };
  }

  @Get(':id/options')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiGetSucursalesOptionsSwagger()
  async getSucursalesOptions(@Param('id', ParseIntPipe) id: number) {
    return await this.getSucursalesOptionsUseCase.execute(id);
  }

  @Get(':id')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  @ApiFindSucursalByIdSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getSucursalByIdUseCase.execute(id);
    return {
      message: 'Sucursal obtenida exitosamente',
      data,
    };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiCreateSucursalSwagger()
  async create(@Body() dto: CreateSucursalHttpDto) {
    const data = await this.createSucursalUseCase.execute(dto);
    return {
      message: 'Sucursal creada exitosamente',
      data,
    };
  }

  @Patch(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiUpdateSucursalSwagger()
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
  @ApiToggleSucursalStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleSucursalStatusUseCase.execute(id);
    return {
      message: 'Estado de la sucursal actualizado exitosamente',
      data,
    };
  }
}