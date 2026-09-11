// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Casos de Uso de Email
import { SendResetPasswordEmailUseCase } from './application/send-reset-password-email.use-case';
import { SendVerificationEmailUseCase } from './application/send-verification-email.use-case';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const fromName =
          config.get<string>('MAIL_FROM_NAME') || 'HelpDesk Support';
        const mailUser = config.get<string>('MAIL_USER');

        return {
          transport: {
            host: config.get<string>('MAIL_HOST'),
            port: Number(config.get<number>('MAIL_PORT')),
            secure: true, // true para puerto 465 (SSL)
            auth: {
              user: mailUser,
              pass: config.get<string>('MAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"${fromName}" <${mailUser}>`,
          },
        };
      },
    }),
  ],
  providers: [SendResetPasswordEmailUseCase, SendVerificationEmailUseCase],
  exports: [
    MailerModule,
    SendResetPasswordEmailUseCase,
    SendVerificationEmailUseCase,
  ],
})
export class MailModule {}
