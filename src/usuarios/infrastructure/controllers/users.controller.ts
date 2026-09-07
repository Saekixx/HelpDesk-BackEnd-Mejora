import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { UpdateProfileDTO } from '../dtos/update-profile.request.dto';
import { CreateUserUseCase } from '@/usuarios/application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from '@/usuarios/application/use-cases/update-profile.use-case';
import { JwtAuthGuard } from '@/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/infrastructure/decorators/current-user.decorator';
import { GetUsersQueryDto } from '../dtos/get-users-query.dto';
import { GetUsersUseCase } from '@/usuarios/application/use-cases/get-users.use-case';

@Controller('usuario')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
  ) {}

  @Get()
  async findAll(@Query() query: GetUsersQueryDto) {
    return await this.getUsersUseCase.execute(query);
  }

  @Post('create')
  async create(@Body() dto: CreateUserRequestDto) {
    const data = await this.createUserUseCase.execute(dto);
    return {
      message: 'Usuario creado exitosamente',
      data,
    };
  }

  @Patch('perfil')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser('userId') userId: number, // Extraemos el userId del payload del token JWT usando el decorador @CurrentUser
    @Body() dto: UpdateProfileDTO,
  ) {
    return await this.updateProfileUseCase.execute(userId, dto);
  }
}
