// src/auth/application/use-cases/forgot-password.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { SendResetPasswordEmailUseCase } from '@/mail/application/send-reset-password-email.use-case';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendResetPasswordEmailUseCase: SendResetPasswordEmailUseCase,
  ) {}

  async execute(correo: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByCorreo(correo);

    // Por seguridad, si el usuario no existe, respondemos igual sin revelar si el correo está registrado
    if (!user) {
      return {
        message:
          'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.',
      };
    }

    // Generar token JWT para restablecimiento
    const resetToken = this.jwtService.sign(
      { id_usuario: user.id_usuario },
      {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
        expiresIn: '15m',
      },
    );

    // Disparar envío de correo
    await this.sendResetPasswordEmailUseCase.execute(user.correo, resetToken);

    return {
      message:
        'Si el correo existe en nuestro sistema, recibirás un enlace de recuperación.',
    };
  }
}
