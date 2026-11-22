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

describe('SendFirstAccessEmailUseCase', () => {
  let mocks: MailMocks;
  let useCases: MailUseCases;

  const email = 'nuevo@empresa.com';
  const nombre = 'Jack';
  const token = 'first-access-token';

  beforeEach(async () => {
    mocks = createMailMocks();
    useCases = await createMailUseCases(mocks);
  });

  it('envía el correo de primer acceso con destinatario, saludo, asunto y enlace correctos', async () => {
    await expect(
      useCases.firstAccess.execute(email, nombre, token),
    ).resolves.toBeUndefined();

    expect(mocks.configService.get).toHaveBeenCalledWith('FRONTEND_URL');
    const mail = getSentMail(mocks);
    expect(mail.to).toBe(email);
    expect(mail.subject).toBe(
      'Tu cuenta de HelpDesk está lista - Crea tu contraseña',
    );
    expect(mail.html).toContain(`Hola ${nombre},`);
    expect(mail.html).toContain(
      `href="${DEFAULT_FRONTEND_URL}/reset-password?token=${token}"`,
    );
    expect(mail.html).toContain('Crear mi contraseña');
    expect(mail.html).toContain('Este enlace expirará en 24 horas');
  });

  it('usa el FRONTEND_URL configurado en la pantalla de restablecimiento', async () => {
    mocks = createMailMocks({ frontendUrl: 'https://portal.ejemplo.com' });
    useCases = await createMailUseCases(mocks);

    await useCases.firstAccess.execute(email, nombre, token);

    const mail = getSentMail(mocks);
    expect(mail.html).toContain(
      `href="https://portal.ejemplo.com/reset-password?token=${token}"`,
    );
    expect(mail.html).not.toContain(DEFAULT_FRONTEND_URL);
  });

  it('interpola nombres compuestos y con acentos sin normalizarlos', async () => {
    const rawNombre = 'María José Pérez';

    await useCases.firstAccess.execute(email, rawNombre, token);

    expect(getSentMail(mocks).html).toContain(`Hola ${rawNombre},`);
  });

  it('caso borde: nombre vacío deja el saludo "Hola ," (comportamiento actual)', async () => {
    await useCases.firstAccess.execute(email, '', token);

    expect(getSentMail(mocks).html).toContain('Hola ,');
  });

  it('caso borde: sin FRONTEND_URL el enlace queda con "undefined" (comportamiento actual)', async () => {
    mocks = createMailMocks({ omitFrontendUrl: true });
    useCases = await createMailUseCases(mocks);

    await useCases.firstAccess.execute(email, nombre, token);

    expect(getSentMail(mocks).html).toContain(
      `href="undefined/reset-password?token=${token}"`,
    );
  });

  it('propaga un Error plano del proveedor SMTP', async () => {
    mocks.mailerService.sendMail.mockRejectedValue(
      new Error('Bandeja de salida rechazada'),
    );

    await expect(
      useCases.firstAccess.execute(email, nombre, token),
    ).rejects.toThrow('Bandeja de salida rechazada');
  });

  it('propaga HttpException del proveedor SMTP', async () => {
    mocks.mailerService.sendMail.mockRejectedValue(
      new ServiceUnavailableException('Servicio de correo no disponible'),
    );

    await expect(
      useCases.firstAccess.execute(email, nombre, token),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('propaga DomainException derivada conservando su identidad', async () => {
    const failure = new TestDomainException('Alta de correo rechazada', 502);
    mocks.mailerService.sendMail.mockRejectedValue(failure);

    const result = useCases.firstAccess.execute(email, nombre, token);
    await expect(result).rejects.toBe(failure);
    await expect(result).rejects.toMatchObject({ statusCode: 502 });
  });

  it('no envía el correo si falla la lectura de configuración', async () => {
    mocks.configService.get.mockImplementation(() => {
      throw new Error('Configuración no disponible');
    });

    await expect(
      useCases.firstAccess.execute(email, nombre, token),
    ).rejects.toThrow('Configuración no disponible');
    expect(mocks.mailerService.sendMail).not.toHaveBeenCalled();
  });
});
