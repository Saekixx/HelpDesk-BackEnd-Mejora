import { ServiceUnavailableException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  createMailMocks,
  createMailUseCases,
  DEFAULT_FRONTEND_URL,
  getSentMail,
  TestDomainException,
  type MailMocks,
  type MailUseCases,
} from './helpers';

describe('SendVerificationEmailUseCase', () => {
  let mocks: MailMocks;
  let useCases: MailUseCases;

  const email = 'jack@empresa.com';
  const token = 'token-abc-123';

  beforeEach(async () => {
    mocks = createMailMocks();
    useCases = await createMailUseCases(mocks);
  });

  it('envía el correo de verificación con destinatario, asunto y enlace correctos', async () => {
    await expect(
      useCases.verification.execute(email, token),
    ).resolves.toBeUndefined();

    expect(mocks.configService.get).toHaveBeenCalledWith('FRONTEND_URL');
    const mail = getSentMail(mocks);
    expect(mail.to).toBe(email);
    expect(mail.subject).toBe(
      'Activa tu cuenta y crea tu contraseña - HelpDesk',
    );
    expect(mail.html).toContain(
      `href="${DEFAULT_FRONTEND_URL}/confirm-email?token=${token}"`,
    );
    expect(mail.html).toContain('Completar Registro y Crear Contraseña');
    expect(mail.html).toContain('Este enlace expirará en 24 horas');
  });

  it('usa el FRONTEND_URL devuelto por ConfigService en el enlace', async () => {
    mocks = createMailMocks({ frontendUrl: 'https://portal.ejemplo.com' });
    useCases = await createMailUseCases(mocks);

    await useCases.verification.execute(email, token);

    const mail = getSentMail(mocks);
    expect(mail.html).toContain(
      `href="https://portal.ejemplo.com/confirm-email?token=${token}"`,
    );
    expect(mail.html).not.toContain(DEFAULT_FRONTEND_URL);
  });

  it('reenvía destinatario y token sin normalizar ni codificar', async () => {
    const rawEmail = 'Jack.Moreno@Empresa.COM';
    const rawToken = 'abc+123/==';

    await useCases.verification.execute(rawEmail, rawToken);

    const mail = getSentMail(mocks);
    expect(mail.to).toBe(rawEmail);
    expect(mail.html).toContain(
      `href="${DEFAULT_FRONTEND_URL}/confirm-email?token=${rawToken}"`,
    );
  });

  it('caso borde: sin FRONTEND_URL el enlace queda con "undefined" (comportamiento actual)', async () => {
    mocks = createMailMocks({ omitFrontendUrl: true });
    useCases = await createMailUseCases(mocks);

    await useCases.verification.execute(email, token);

    const mail = getSentMail(mocks);
    expect(mail.html).toContain(
      `href="undefined/confirm-email?token=${token}"`,
    );
  });

  it('caso borde: un email vacío se reenvía tal cual sin validación', async () => {
    await useCases.verification.execute('', token);

    expect(getSentMail(mocks).to).toBe('');
  });

  it('propaga un Error plano del proveedor SMTP', async () => {
    mocks.mailerService.sendMail.mockRejectedValue(new Error('SMTP caído'));

    await expect(
      useCases.verification.execute(email, token),
    ).rejects.toThrow('SMTP caído');
    expect(mocks.mailerService.sendMail).toHaveBeenCalledOnce();
  });

  it('propaga HttpException del proveedor SMTP', async () => {
    mocks.mailerService.sendMail.mockRejectedValue(
      new ServiceUnavailableException('Servicio de correo no disponible'),
    );

    const result = useCases.verification.execute(email, token);
    await expect(result).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(result).rejects.toMatchObject({
      message: 'Servicio de correo no disponible',
    });
  });

  it('propaga DomainException derivada sin convertirla en otra excepción', async () => {
    const failure = new TestDomainException('Proveedor rechazó el correo', 502);
    mocks.mailerService.sendMail.mockRejectedValue(failure);

    const result = useCases.verification.execute(email, token);
    await expect(result).rejects.toBe(failure);
    await expect(result).rejects.toMatchObject({ statusCode: 502 });
  });

  it('no intenta enviar si ConfigService falla al leer la configuración', async () => {
    mocks.configService.get.mockImplementation(() => {
      throw new Error('Configuración no disponible');
    });

    await expect(
      useCases.verification.execute(email, token),
    ).rejects.toThrow('Configuración no disponible');
    expect(mocks.mailerService.sendMail).not.toHaveBeenCalled();
  });
});
