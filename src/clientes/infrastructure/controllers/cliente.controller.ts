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
import { GetClientesOptionsUseCase } from '@/clientes/application/use-cases/cliente/get-clientes-options.use-case';
import { GetClientesUseCase } from '@/clientes/application/use-cases/cliente/get-clientes.use-case';
import { GetClienteByIdUseCase } from '@/clientes/application/use-cases/cliente/get-cliente-by-id.use-case';
import { CreateClienteUseCase } from '@/clientes/application/use-cases/cliente/create-cliente.use-case';
import { UpdateClienteUseCase } from '@/clientes/application/use-cases/cliente/update-cliente.use-case';
import { ToggleClienteStatusUseCase } from '@/clientes/application/use-cases/cliente/toggle-cliente-status.use-case';
import { GetClienteStatsUseCase } from '@/clientes/application/use-cases/cliente/get-cliente-stats.use-case';
import { GetClientesQueryDto } from '../dtos/get-clientes-query.dto';
import { CreateClienteRequestDto } from '../dtos/create-cliente.dto';
import { CreateClienteResponseDto } from '../dtos/create-cliente-response.dto';
import { UpdateClienteRequestDto } from '../dtos/update-cliente.dto';
import { UpdateClienteResponseDto } from '../dtos/update-cliente-response.dto';
import { ClienteDetailResponseDto } from '../dtos/cliente-detail-response.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import {
  ApiFindAllClientesSwagger,
  ApiGetClientesOptionsSwagger,
  ApiGetClienteStatsSwagger,
  ApiFindClienteByIdSwagger,
  ApiCreateClienteSwagger,
  ApiUpdateClienteSwagger,
  ApiToggleClienteStatusSwagger,
} from '../docs/cliente.swagger';

@ApiTags('Clientes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly getClientesOptionsUseCase: GetClientesOptionsUseCase,
    private readonly getClientesUseCase: GetClientesUseCase,
    private readonly getClienteByIdUseCase: GetClienteByIdUseCase,
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase,
    private readonly toggleClienteStatusUseCase: ToggleClienteStatusUseCase,
    private readonly getClienteStatsUseCase: GetClienteStatsUseCase,
  ) {}

  @Get()
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindAllClientesSwagger()
  async findAll(@Query() filter: GetClientesQueryDto) {
    const { data, meta } = await this.getClientesUseCase.execute(filter);
    return {
      message: 'Clientes obtenidos exitosamente',
      data: { data, meta },
    };
  }

  @Get('/options')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetClientesOptionsSwagger()
  async getClientesOptions() {
    return await this.getClientesOptionsUseCase.execute();
  }

  // Debe declararse antes de @Get(':id') para que 'estadisticas' no se interprete como un id
  @Get('estadisticas')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetClienteStatsSwagger()
  async getEstadisticas() {
    const data = await this.getClienteStatsUseCase.execute();
    return {
      message: 'Estadísticas de clientes obtenidas exitosamente',
      data,
    };
  }

  @Get(':id')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindClienteByIdSwagger()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; data: ClienteDetailResponseDto }> {
    const data = await this.getClienteByIdUseCase.execute(id);
    return {
      message: 'Cliente obtenido exitosamente',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiCreateClienteSwagger()
  async create(
    @Body() dto: CreateClienteRequestDto,
  ): Promise<{ message: string; data: CreateClienteResponseDto }> {
    const data = await this.createClienteUseCase.execute(dto);
    return {
      message: 'Empresa y cuenta principal registradas correctamente',
      data,
    };
  }

  @Patch(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiUpdateClienteSwagger()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteRequestDto,
  ): Promise<{ message: string; data: UpdateClienteResponseDto }> {
    const data = await this.updateClienteUseCase.execute(id, dto);
    return {
      message: 'Cliente actualizado exitosamente',
      data,
    };
  }

  @Patch(':id/toggle-status')
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiToggleClienteStatusSwagger()
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleClienteStatusUseCase.execute(id);
    return {
      message: 'Estado del cliente actualizado exitosamente',
      data,
    };
  }
}
