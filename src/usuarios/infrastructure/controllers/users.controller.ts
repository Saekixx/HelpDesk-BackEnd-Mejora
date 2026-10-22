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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { UpdateProfileDTO } from '../dtos/update-profile.request.dto';
import { AssignRolRequestDto } from '../dtos/assign-rol.request.dto';
import { CreateUserUseCase } from '@/usuarios/application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from '@/usuarios/application/use-cases/update-profile.use-case';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from '@/auth/infrastructure/guards/role.guard';
import { Roles } from '@/auth/infrastructure/decorators/roles.decorator';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { CurrentUser } from '@/auth/infrastructure/decorators/current-user.decorator';
import { GetUsersQueryDto } from '../dtos/get-users-query.dto';
import { GetUsersUseCase } from '@/usuarios/application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from '@/usuarios/application/use-cases/get-user-by-id.use-case';
import {
  ApiAssignRolSwagger,
  ApiCreateUserSwagger,
  ApiDownloadBulkUserTemplateSwagger,
  ApiFindAllUsersSwagger,
  ApiFindUserByIdSwagger,
  ApiFindUserOptionsSwagger,
  ApiGetUserStatsSwagger,
  ApiToggleUserStatusSwagger,
  ApiUpdateProfileSwagger,
  ApiProcessBulkUsersSwagger,
  ApiUpdateUserSwagger,
  ApiValidateBulkUsersSwagger,
} from '../docs/usuarios.swagger';
import { ToggleUserStatusUseCase } from '@/usuarios/application/use-cases/toggle-user-status.use-case';
import { AssignRolUseCase } from '@/usuarios/application/use-cases/assign-rol.use-case';
import { UpdateUserDto } from '../dtos/update-user.request.dto';
import { UpdateUserUseCase } from '@/usuarios/application/use-cases/update-user.use-case';
import { GetUserOptionUseCase } from '@/usuarios/application/use-cases/get-user-option.use-case';
import { UserSelectFilterDto } from '../dtos/user-select-filter-dto';
import { GetUserStatsUseCase } from '@/usuarios/application/use-cases/get-user-stats.use-case';
import { GetBulkUserTemplateUseCase } from '@/usuarios/application/use-cases/get-bulk-user-template.use-case';
import { ValidateBulkUsersUseCase } from '@/usuarios/application/use-cases/validate-bulk-users.use-case';
import { ProcessBulkUsersUseCase } from '@/usuarios/application/use-cases/process-bulk-users.use-case';
import type { BulkUploadedFile } from '@/usuarios/application/dtos/validate-bulk-users.dto';
import { ValidateBulkUsersRequestDto } from '../dtos/validate-bulk-users.request.dto';
import { ProcessBulkUsersRequestDto } from '../dtos/process-bulk-users.request.dto';

const MAX_BULK_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@ApiTags('Usuarios')
@Controller('usuario')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly assignRolUseCase: AssignRolUseCase,
    private readonly toggleUserStatusUseCase: ToggleUserStatusUseCase,
    private readonly getUserOptionUseCase: GetUserOptionUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase,
    private readonly getBulkUserTemplateUseCase: GetBulkUserTemplateUseCase,
    private readonly validateBulkUsersUseCase: ValidateBulkUsersUseCase,
    private readonly processBulkUsersUseCase: ProcessBulkUsersUseCase,
  ) {}

  @Get('options')
  @UseGuards(JwtAuthGuard)
  @ApiFindUserOptionsSwagger()
  async findOptions(@Query() filters: UserSelectFilterDto) {
    return await this.getUserOptionUseCase.execute(filters);
  }

  // Debe declararse antes de @Get(':id') para que 'estadisticas' no se interprete como un id
  @Get('estadisticas')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiGetUserStatsSwagger()
  async getEstadisticas() {
    const data = await this.getUserStatsUseCase.execute();
    return {
      message: 'Estadísticas de usuarios obtenidas exitosamente',
      data,
    };
  }

  // Descarga binaria
  @Get('carga-masiva/plantilla')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiDownloadBulkUserTemplateSwagger()
  async downloadBulkUserTemplate(
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const { buffer, filename, mimeType } =
      await this.getBulkUserTemplateUseCase.execute();

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.status(HttpStatus.OK).send(buffer);
  }

  // Pre-validación: no crea ni modifica usuarios, solo analiza el archivo contra la BD
  @Post('carga-masiva/validar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_BULK_FILE_SIZE } }),
  )
  @ApiValidateBulkUsersSwagger()
  async validateBulkUsers(
    @UploadedFile() file: BulkUploadedFile | undefined,
    @Body() body: ValidateBulkUsersRequestDto,
  ) {
    const data = await this.validateBulkUsersUseCase.execute({
      file,
      idCliente: body.id_cliente,
    });
    return {
      message: 'Validación de la carga masiva completada',
      data,
    };
  }

  // Registro definitivo: revalida el lote en servidor y crea los usuarios en una sola transacción
  @Post('carga-masiva/procesar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiProcessBulkUsersSwagger()
  async processBulkUsers(@Body() body: ProcessBulkUsersRequestDto) {
    const data = await this.processBulkUsersUseCase.execute({
      idCliente: body.id_cliente,
      enviarCredenciales: body.enviarCredenciales,
      usuarios: body.usuarios,
    });
    return {
      message: `Carga masiva procesada: ${data.creados} usuario(s) creado(s), ${data.conError} con error`,
      data,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindAllUsersSwagger()
  async findAll(@Query() query: GetUsersQueryDto) {
    const { data, meta } = await this.getUsersUseCase.execute(query);
    return {
      message: 'Usuarios obtenidos exitosamente',
      data: { data, meta },
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR, RolEnum.SOPORTE_INSITU, RolEnum.SOPORTE_TECNICO)
  @ApiFindUserByIdSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getUserByIdUseCase.execute(id);
    return {
      message: 'Usuario obtenido exitosamente',
      data,
    };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiCreateUserSwagger()
  async create(@Body() dto: CreateUserRequestDto) {
    const data = await this.createUserUseCase.execute(dto);
    return {
      message: 'Usuario creado exitosamente',
      data,
    };
  }

  // Debe declararse antes de @Patch(':id') para que 'perfil' no se interprete como un id
  // Cualquier usuario autenticado puede editar su propio perfil (no exige roles)
  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateProfileSwagger()
  async update(
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdateProfileDTO,
  ) {
    return await this.updateProfileUseCase.execute(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiUpdateUserSwagger()
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.updateUserUseCase.execute(id, dto);
    return {
      message: 'Usuario actualizado exitosamente',
      data,
    };
  }

  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiAssignRolSwagger()
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolRequestDto,
  ) {
    return await this.assignRolUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(RolEnum.ADMINISTRADOR)
  @ApiToggleUserStatusSwagger()
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') currentUserId: number,
  ) {
    return await this.toggleUserStatusUseCase.execute(id, currentUserId);
  }
}
