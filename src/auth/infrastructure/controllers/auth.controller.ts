import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginRequestDto } from '../dtos/login.request.dto';
import { RegisterRequestDto } from '../dtos/register.request.dto';
import { ApiLoginSwagger, ApiRegisterSwagger } from '../docs/auth.swagger';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly authRegisterUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLoginSwagger()
  async login(@Body() dto: LoginRequestDto) {
    const data = await this.loginUseCase.execute(dto.correo, dto.password);
    return {
      message: 'Login exitoso',
      data,
    };
  }

  @Post('register')
  @ApiRegisterSwagger()
  async register(@Body() dto: RegisterRequestDto) {
    const data = await this.authRegisterUseCase.execute(dto);
    return {
      message: 'Usuario registrado exitosamente',
      data,
    };
  }
}
