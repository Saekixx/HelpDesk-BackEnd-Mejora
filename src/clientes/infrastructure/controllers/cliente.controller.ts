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
import { GetClientesOptionsUseCase } from '@/clientes/application/use-cases/cliente/get-clientes-options.use-case';
import { GetClientesUseCase } from '@/clientes/application/use-cases/cliente/get-clientes.use-case';
import { GetClienteByIdUseCase } from '@/clientes/application/use-cases/cliente/get-cliente-by-id.use-case';
import { CreateClienteUseCase } from '@/clientes/application/use-cases/cliente/create-cliente.use-case';
import { UpdateClienteUseCase } from '@/clientes/application/use-cases/cliente/update-cliente.use-case';
import { ToggleClienteStatusUseCase } from '@/clientes/application/use-cases/cliente/toggle-cliente-status.use-case';
import { GetClientesQueryDto } from '../dtos/get-clientes-query.dto';
import { CreateClienteRequestDto } from '../dtos/create-cliente.dto';
import { UpdateClienteRequestDto } from '../dtos/update-cliente.dto';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';

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
  ) {}

  @Get()
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  async findAll(@Query() query: GetClientesQueryDto) {
    const data = await this.getClientesUseCase.execute(query);
    return {
      message: 'Clientes obtenidos exitosamente',
      data,
    };
  }

  // NOTA: '/options' debe declararse antes de ':id' para que no sea
  // interpretado como un parámetro de ruta.
  @Get('/options')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  async getClientesOptions() {
    return await this.getClientesOptionsUseCase.execute();
  }

  @Get(':id')
  @Roles(
    RolEnum.ADMINISTRADOR,
    RolEnum.SOPORTE_INSITU,
    RolEnum.SOPORTE_REMOTO,
  )
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getClienteByIdUseCase.execute(id);
    return {
      message: 'Cliente obtenido exitosamente',
      data,
    };
  }

  @Post()
  @Roles(RolEnum.ADMINISTRADOR)
  async create(@Body() dto: CreateClienteRequestDto) {
    const data = await this.createClienteUseCase.execute(dto);
    return {
      message: 'Cliente creado exitosamente',
      data,
    };
  }

  @Patch(':id')
  @Roles(RolEnum.ADMINISTRADOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClienteRequestDto,
  ) {
    const data = await this.updateClienteUseCase.execute(id, dto);
    return {
      message: 'Cliente actualizado exitosamente',
      data,
    };
  }

  @Patch(':id/toggle-status')
  @Roles(RolEnum.ADMINISTRADOR)
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const data = await this.toggleClienteStatusUseCase.execute(id);
    return {
      message: 'Estado del cliente actualizado exitosamente',
      data,
    };
  }
}