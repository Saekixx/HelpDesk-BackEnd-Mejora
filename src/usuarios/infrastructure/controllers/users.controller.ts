import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserRequestDto } from '../dtos/create-user.request.dto';
import { UpdateProfileDTO } from '../dtos/update-profile.request.dto';
import { CreateUserUseCase } from '@/usuarios/application/use-cases/create-user.use-case';
import { UpdateProfileUseCase } from '@/usuarios/application/use-cases/update-profile.use-case';

@Controller('usuario')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateUserRequestDto) {
    return await this.createUserUseCase.execute(dto);
  }

  @Post('perfil/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') userId: number, @Body() dto: UpdateProfileDTO) {
    return await this.updateProfileUseCase.execute(userId, dto);
  }
}
