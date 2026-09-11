import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

// Caso de uso para enviar un correo electrónico de restablecimiento de contraseña
// Este caso de uso encapsula la lógica para enviar un correo electrónico de restablecimiento de contraseña
// a un usuario que ha solicitado restablecer su contraseña. Utiliza el servicio de correo (MailerService) y la configuración
// de la aplicación (ConfigService) para construir y enviar el correo electrónico.

@Injectable()
export class SendResetPasswordEmailUseCase {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Restablecer contraseña - HelpDesk',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #FF5722; text-align: center;">Recuperación de Contraseña</h2>
          <p style="color: #424242; font-size: 16px;">Hola,</p>
          <p style="color: #616161; font-size: 15px; line-height: 1.5;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta de HelpDesk. Haz clic en el botón de abajo para ingresar una nueva contraseña:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #FF5722; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #757575; font-size: 13px;">
            Este enlace expirará en 15 minutos. Si no solicitaste este cambio, omite este correo y tu contraseña continuará siendo la misma.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #9e9e9e; font-size: 12px; text-align: center;">
            Soporte HelpDesk &copy; 2026
          </p>
        </div>
      `,
    });
  }
}
