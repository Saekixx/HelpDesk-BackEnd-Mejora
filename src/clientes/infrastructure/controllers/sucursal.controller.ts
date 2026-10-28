import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { GetSucursalStatsUseCase } from '@/clientes/application/use-cases/sucursal/get-sucursal-stats.use-case';
import { CreateSucursalUseCase } from '@/clientes/application/use-cases/sucursal/create-sucursal.use-case';
import { UpdateSucursalUseCase } from '@/clientes/application/use-cases/sucursal/update-sucursal.use-case';
import { ToggleSucursalStatusUseCase } from '@/clientes/application/use-cases/sucursal/toggle-sucursal-status.use-case';
import { GetSucursalesQueryDto } from '../dtos/get-sucursales-query.dto';
import { CreateSucursalHttpDto } from '../dtos/create-sucursal-http.dto';
import { CreateSucursalResponseDto } from '../dtos/create-sucursal-response.dto';
import { UpdateSucursalHttpDto } from '../dtos/update-sucursal-http.dto';
import { GetSucursalDetailResponseDto } from '../dtos/get-sucursal-detail-response.dto';
import { GetSucursalStatsResponseDto } from '../dtos/get-sucursal-stats-response.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  ApiFindAllSucursalesSwagger,
  ApiGetSucursalesOptionsSwagger,
  ApiFindSucursalByIdSwagger,
  ApiFindSucursalStatsSwagger,
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
    private readonly getSucursalStatsUseCase: GetSucursalStatsUseCase,
    private readonly createSucursalUseCase: CreateSucursalUseCase,
    private readonly updateSucursalUseCase: UpdateSucursalUseCase,
    private readonly toggleSucursalStatusUseCase: ToggleSucursalStatusUseCase,
  ) {}

  @Get()
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindAllSucursalesSwagger()
  async findAll(@Query() query: GetSucursalesQueryDto) {
    const data = await this.getSucursalesUseCase.execute(query);
    return {
      message: 'Sucursales obtenidas exitosamente',
      data,
    };
  }

  // Debe declararse antes de @Get(':id'); de lo contrario "estadisticas" se
  // interpretaría como un id y ParseIntPipe respondería 400.
  @Get('estadisticas')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindSucursalStatsSwagger()
  async getEstadisticas(): Promise<{
    message: string;
    data: GetSucursalStatsResponseDto;
  }> {
    const data = await this.getSucursalStatsUseCase.execute();
    return {
      message: 'Estadísticas de sucursales obtenidas exitosamente',
      data,
    };
  }

  @Get(':id/options')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetSucursalesOptionsSwagger()
  async getSucursalesOptions(@Param('id', ParseIntPipe) id: number) {
    return await this.getSucursalesOptionsUseCase.execute(id);
  }

  @Get(':id')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindSucursalByIdSwagger()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; data: GetSucursalDetailResponseDto }> {
    const data = await this.getSucursalByIdUseCase.execute(id);
    return {
      message: 'Sucursal obtenida exitosamente',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiCreateSucursalSwagger()
  async create(
    @Body() dto: CreateSucursalHttpDto,
  ): Promise<{ message: string; data: CreateSucursalResponseDto }> {
    const data = await this.createSucursalUseCase.execute(dto);
    return {
      message: 'Sucursal y cuenta de encargado local creadas correctamente',
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
