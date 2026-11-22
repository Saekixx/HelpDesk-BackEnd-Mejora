// src/mail/application/send-first-access-email.use-case.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

// Caso de uso para enviar el correo de primer acceso a un usuario creado por carga masiva.
// La cuenta ya existe (con una contraseña que nadie conoce), así que el enlace reutiliza la
// pantalla de restablecimiento de contraseña del frontend para que el usuario defina la suya.

@Injectable()
export class SendFirstAccessEmailUseCase {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string, nombre: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Tu cuenta de HelpDesk está lista - Crea tu contraseña',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #FF5722; text-align: center;">¡Bienvenido a HelpDesk!</h2>
          <p style="color: #424242; font-size: 16px;">Hola ${nombre},</p>
          <p style="color: #616161; font-size: 15px; line-height: 1.5;">
            Se ha creado una cuenta para ti en HelpDesk. Para acceder por primera vez, define tu contraseña personal haciendo clic en el siguiente botón:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #FF5722; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
              Crear mi contraseña
            </a>
          </div>
          <p style="color: #757575; font-size: 13px;">
            Este enlace expirará en 24 horas. Si no esperabas este correo, puedes ignorarlo de manera segura.
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
