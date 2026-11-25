import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { CreateCitaAndDerivateTicketUseCase } from '@/citas/application/use-case/citas/create-cita-and-derivate-ticket.use-case';
import {
  ApiCreateCitaAndDerivateTicketSwagger,
  ApiGetCitaDetalleSwagger,
  ApiGetCitasSwagger,
} from '../docs/citas-soporte.swagger';
import { FindByCitaDetalleUseCase } from '@/citas/application/use-case/citas/find-by-cita-detalle.use-case';
import { GetCitasUseCase } from '@/citas/application/use-case/citas/get-citas.use-case';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { CitaSoporteFilterDto } from '../dto/cita-soporte-filter.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Citas de Soporte')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('citas-soporte')
export class CitasSoporteController {
  constructor(
    private readonly createCitaAndDerivateTicketUseCase: CreateCitaAndDerivateTicketUseCase,
    private readonly getCitasUseCase: GetCitasUseCase,
    private readonly findByCitaDetalleUseCase: FindByCitaDetalleUseCase,
  ) {}

  @Get()
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetCitasSwagger()
  async findAll(@Query() query: CitaSoporteFilterDto) {
    const {
      search,
      id_cliente,
      id_sucursal,
      estado,
      fecha_programada,
      page,
      limit,
    } = query;

    const result = await this.getCitasUseCase.execute({
      search,
      id_cliente,
      id_sucursal,
      estado,
      fecha_programada,
      page,
      limit,
    });

    return {
      message: 'Citas de soporte obtenidas correctamente',
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiGetCitaDetalleSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.findByCitaDetalleUseCase.execute(id);
    return {
      message: 'Cita de soporte obtenida exitosamente',
      data,
    };
  }

  @Post('derivar')
  @ApiCreateCitaAndDerivateTicketSwagger()
  async derivarTicketInSitu(@Body() dto: CreateCitaDto) {
    return await this.createCitaAndDerivateTicketUseCase.execute(dto);
  }
}
