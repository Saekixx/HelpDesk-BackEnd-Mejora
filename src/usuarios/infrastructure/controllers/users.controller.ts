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
import { ApiTags } from '@nestjs/swagger';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { UpdateProfileDTO } from '../dtos/update-profile.request.dto';
import { CreateUserUseCase } from '@/usuarios/application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from '@/usuarios/application/use-cases/update-profile.use-case';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/infrastructure/decorators/current-user.decorator';
import { GetUsersQueryDto } from '../dtos/get-users-query.dto';
import { GetUsersUseCase } from '@/usuarios/application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from '@/usuarios/application/use-cases/get-user-by-id.use-case';
import {
  ApiCreateUserSwagger,
  ApiFindAllUsersSwagger,
  ApiFindUserByIdSwagger,
  ApiUpdateProfileSwagger,
} from '../docs/usuarios.swagger';
import { ToggleUserStatusUseCase } from '@/usuarios/application/use-cases/toggle-user-status.use-case';
import { AssignRolUseCase } from '@/usuarios/application/use-cases/assign-rol.use-case';
import { AssignRolDTO } from '@/usuarios/application/dtos/assign-rol.use-case';

@ApiTags('Usuarios')
@Controller('usuario')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly assignRolUseCase: AssignRolUseCase,
    private readonly toggleUserStatusUseCase: ToggleUserStatusUseCase,
  ) {}

  @Get()
  @ApiFindAllUsersSwagger()
  async findAll(@Query() query: GetUsersQueryDto) {
    const data = await this.getUsersUseCase.execute(query);
    return {
      message: 'Usuarios obtenidos exitosamente',
      data,
    };
  }

  @Get(':id')
  @ApiFindUserByIdSwagger()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.getUserByIdUseCase.execute(id);
    return {
      message: 'Usuario obtenido exitosamente',
      data,
    };
  }

  @Post('create')
  @ApiCreateUserSwagger()
  async create(@Body() dto: CreateUserRequestDto) {
    const data = await this.createUserUseCase.execute(dto);
    return {
      message: 'Usuario creado exitosamente',
      data,
    };
  }

  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiUpdateProfileSwagger()
  async update(
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdateProfileDTO,
  ) {
    return await this.updateProfileUseCase.execute(userId, dto);
  }

  @Patch(':id/rol')
  @UseGuards(JwtAuthGuard)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolDTO,
  ) {
    return await this.assignRolUseCase.execute(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') currentUserId: number,
  ) {
    return await this.toggleUserStatusUseCase.execute(id, currentUserId);
  }
}
