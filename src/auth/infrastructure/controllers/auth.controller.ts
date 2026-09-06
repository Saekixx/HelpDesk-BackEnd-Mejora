import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginRequestDto } from '../dtos/login.request.dto';
import { RegisterRequestDto } from '../dtos/register.request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly authRegisterUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto) {
    return await this.loginUseCase.execute(dto.correo, dto.password);
  }

  @Post('register')
  async register(@Body() dto: RegisterRequestDto) {
    return await this.authRegisterUseCase.execute(dto);
  }
}
