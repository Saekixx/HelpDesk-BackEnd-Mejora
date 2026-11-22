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

describe('SendResetPasswordEmailUseCase', () => {
  let mocks: MailMocks;
  let useCases: MailUseCases;

  const email = 'jack@empresa.com';
  const token = 'reset-token-xyz';

  beforeEach(async () => {
    mocks = createMailMocks();
    useCases = await createMailUseCases(mocks);
  });

  it('envía el correo de restablecimiento con destinatario, asunto y enlace correctos', async () => {
    await expect(
      useCases.resetPassword.execute(email, token),
    ).resolves.toBeUndefined();

    expect(mocks.configService.get).toHaveBeenCalledWith('FRONTEND_URL');
    const mail = getSentMail(mocks);
    expect(mail.to).toBe(email);
    expect(mail.subject).toBe('Restablecer contraseña - HelpDesk');
    expect(mail.html).toContain(
      `href="${DEFAULT_FRONTEND_URL}/reset-password?token=${token}"`,
    );
    expect(mail.html).toContain('Recuperación de Contraseña');
    expect(mail.html).toContain('Restablecer Contraseña');
    expect(mail.html).toContain('Este enlace expirará en 15 minutos');
  });

  it('usa el FRONTEND_URL configurado y no el valor por defecto', async () => {
    mocks = createMailMocks({ frontendUrl: 'https://portal.ejemplo.com' });
    useCases = await createMailUseCases(mocks);

    await useCases.resetPassword.execute(email, token);

    const mail = getSentMail(mocks);
    expect(mail.html).toContain(
      `href="https://portal.ejemplo.com/reset-password?token=${token}"`,
    );
    expect(mail.html).not.toContain(DEFAULT_FRONTEND_URL);
  });

  it('reenvía el token sin codificar en la URL', async () => {
    const rawToken = 'token con espacios&mas=/';

    await useCases.resetPassword.execute(email, rawToken);

    expect(getSentMail(mocks).html).toContain(
      `href="${DEFAULT_FRONTEND_URL}/reset-password?token=${rawToken}"`,
    );
  });

  it('caso borde: token vacío genera una URL con el parámetro vacío', async () => {
    await useCases.resetPassword.execute(email, '');

    expect(getSentMail(mocks).html).toContain(
      `href="${DEFAULT_FRONTEND_URL}/reset-password?token="`,
    );
  });

  it('caso borde: sin FRONTEND_URL el enlace queda con "undefined" (comportamiento actual)', async () => {
    mocks = createMailMocks({ omitFrontendUrl: true });
    useCases = await createMailUseCases(mocks);

    await useCases.resetPassword.execute(email, token);

    expect(getSentMail(mocks).html).toContain(
      `href="undefined/reset-password?token=${token}"`,
    );
  });

  it('propaga un Error plano del proveedor SMTP', async () => {
    mocks.mailerService.sendMail.mockRejectedValue(
      new Error('Timeout al conectar con SMTP'),
    );

    await expect(
      useCases.resetPassword.execute(email, token),
    ).rejects.toThrow('Timeout al conectar con SMTP');
  });

  it('propaga HttpException del proveedor SMTP', async () => {
    mocks.mailerService.sendMail.mockRejectedValue(
      new ServiceUnavailableException('Servicio de correo no disponible'),
    );

    await expect(
      useCases.resetPassword.execute(email, token),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('propaga DomainException derivada conservando mensaje y statusCode', async () => {
    const failure = new TestDomainException('No se pudo enviar el reset', 502);
    mocks.mailerService.sendMail.mockRejectedValue(failure);

    await expect(
      useCases.resetPassword.execute(email, token),
    ).rejects.toBe(failure);
  });

  it('no envía el correo si falla la lectura de configuración', async () => {
    mocks.configService.get.mockImplementation(() => {
      throw new Error('FRONTEND_URL no disponible');
    });

    await expect(
      useCases.resetPassword.execute(email, token),
    ).rejects.toThrow('FRONTEND_URL no disponible');
    expect(mocks.mailerService.sendMail).not.toHaveBeenCalled();
  });
});
