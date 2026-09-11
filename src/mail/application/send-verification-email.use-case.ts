// src/mail/application/send-verification-email.use-case.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

// Use Case para enviar un correo de verificación al usuario recién creado
// Este caso de uso encapsula la lógica para enviar un correo electrónico de verificación
// a un usuario que ha sido creado en el sistema. Utiliza el servicio de correo (MailerService)
// y la configuración de la aplicación (ConfigService) para construir y enviar el correo electrónico.

@Injectable()
export class SendVerificationEmailUseCase {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/confirm-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Activa tu cuenta y crea tu contraseña - HelpDesk',
      html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #FF5722; text-align: center;">¡Bienvenido a HelpDesk!</h2>
            <p style="color: #424242; font-size: 16px;">Hola,</p>
            <p style="color: #616161; font-size: 15px; line-height: 1.5;">
                Se ha solicitado la creación de tu cuenta. Para completarla y definir tu contraseña personal de acceso, por favor haz clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="background-color: #FF5722; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
                Completar Registro y Crear Contraseña
                </a>
            </div>
            <p style="color: #757575; font-size: 13px;">
                Este enlace expirará en 24 horas. Si no esperabas esta invitación, puedes ignorar este correo de manera segura.
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
