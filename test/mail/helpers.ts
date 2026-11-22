import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { expect, type Mock, vi } from 'vitest';

import { DomainException } from '@/common/domain/domain.exception';
import { SendFirstAccessEmailUseCase } from '@/mail/application/send-first-access-email.use-case';
import { SendResetPasswordEmailUseCase } from '@/mail/application/send-reset-password-email.use-case';
import { SendVerificationEmailUseCase } from '@/mail/application/send-verification-email.use-case';

export const DEFAULT_FRONTEND_URL = 'https://frontend.helpdesk.local';

export interface MailMocks {
  mailerService: { sendMail: Mock };
  configService: { get: Mock };
}

export interface MailUseCases {
  verification: SendVerificationEmailUseCase;
  resetPassword: SendResetPasswordEmailUseCase;
  firstAccess: SendFirstAccessEmailUseCase;
}

export interface MailTestOptions {
  /** Valor devuelto por ConfigService.get('FRONTEND_URL'). */
  frontendUrl?: string;
  /** Simula que la variable FRONTEND_URL no está configurada. */
  omitFrontendUrl?: boolean;
}

/** Excepción de dominio definida solo en el test; no toca código de aplicación. */
export class TestDomainException extends DomainException {}

/**
 * Mocks del proveedor SMTP y de la configuración. No se abre ninguna conexión:
 * MailerService.sendMail y ConfigService.get son funciones de Vitest.
 */
export function createMailMocks(options: MailTestOptions = {}): MailMocks {
  const frontendUrl = options.omitFrontendUrl
    ? undefined
    : (options.frontendUrl ?? DEFAULT_FRONTEND_URL);

  return {
    mailerService: { sendMail: vi.fn() },
    configService: {
      get: vi.fn().mockImplementation((key: string) =>
        key === 'FRONTEND_URL' ? frontendUrl : undefined,
      ),
    },
  };
}

/**
 * Instancia los casos de uso con los mocks anteriores mediante un módulo de
 * prueba, sin MailerModule.forRootAsync ni transporte SMTP real.
 */
export async function createMailUseCases(
  mocks: MailMocks,
): Promise<MailUseCases> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      SendVerificationEmailUseCase,
      SendResetPasswordEmailUseCase,
      SendFirstAccessEmailUseCase,
      { provide: MailerService, useValue: mocks.mailerService },
      { provide: ConfigService, useValue: mocks.configService },
    ],
  }).compile();

  return {
    verification: moduleRef.get(SendVerificationEmailUseCase),
    resetPassword: moduleRef.get(SendResetPasswordEmailUseCase),
    firstAccess: moduleRef.get(SendFirstAccessEmailUseCase),
  };
}

export interface SentMail {
  to: string;
  subject: string;
  html: string;
}

/** Devuelve el único payload enviado a sendMail y valida que solo hubo un envío. */
export function getSentMail(mocks: MailMocks): SentMail {
  expect(mocks.mailerService.sendMail).toHaveBeenCalledOnce();
  const payload = mocks.mailerService.sendMail.mock.calls[0]?.[0] as
    | SentMail
    | undefined;

  if (!payload) throw new Error('No se capturó el payload de sendMail');
  return payload;
}
