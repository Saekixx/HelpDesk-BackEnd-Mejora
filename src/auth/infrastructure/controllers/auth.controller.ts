import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginRequestDto } from '../dtos/login.request.dto';
import { RegisterRequestDto } from '../dtos/register.request.dto';
import { ConfirmRegisterDto } from '../dtos/confirm-register.dto';

import {
  ApiLoginSwagger,
  ApiRegisterSwagger,
  ApiConfirmRegisterSwagger,
  ApiForgotPasswordSwagger,
  ApiResetPasswordSwagger,
} from '../docs/auth.swagger';

import { ConfirmRegisterUseCase } from '@/auth/application/use-cases/confirm-register.use-case';
import { ForgotPasswordUseCase } from '@/auth/application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '@/auth/application/use-cases/reset-password.use-case';
import { ForgotPasswordDto } from '../dtos/forgot-password.requets.dto';
import { ResetPasswordDto } from '../dtos/reset-password.requets.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly authRegisterUseCase: RegisterUseCase,
    private readonly confirmRegisterUseCase: ConfirmRegisterUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
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

  @Post('confirm-register')
  @ApiConfirmRegisterSwagger()
  async confirmRegister(@Body() dto: ConfirmRegisterDto) {
    const user = await this.confirmRegisterUseCase.execute(dto);
    return {
      status: 201,
      message: 'Cuenta activada y contraseña establecida con éxito',
      data: user,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiForgotPasswordSwagger()
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const response = await this.forgotPasswordUseCase.execute(dto.correo);
    return response;
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiResetPasswordSwagger()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const response = await this.resetPasswordUseCase.execute(dto);
    return response;
  }
}
