import * as crypto from 'crypto';

export class EncryptMasterKeyUtil {
  public encryptMasterKey(text: string): string {
    const secretKey =
      process.env.ENCRYPTION_KEY || 'tu-clave-secreta-de-32-bytes-exactos!';
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  public decryptMasterKey(encryptedText: string): string {
    try {
      // Si el texto no contiene ':', asumimos que no está encriptado (está en texto plano)
      if (!encryptedText.includes(':')) {
        return encryptedText;
      }

      const secretKey =
        process.env.ENCRYPTION_KEY || 'tu-clave-secreta-de-32-bytes-exactos!';
      const [ivHex, encrypted] = encryptedText.split(':');

      if (!ivHex || !encrypted) {
        return encryptedText; // Si falla la estructura, devolvemos el original por seguridad
      }

      const iv = Buffer.from(ivHex, 'hex');
      const key = crypto.createHash('sha256').update(secretKey).digest();
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Error al desencriptar la master key:', error);
      return encryptedText; // Si ocurre cualquier fallo, retorna el valor original para evitar romper el API
    }
  }
}
