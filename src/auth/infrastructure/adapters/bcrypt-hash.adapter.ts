import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashServicePort } from '../../domain/ports/hash.service.port';

@Injectable()
export class BcryptHashAdapter implements HashServicePort {
  // Implementar el método hash utilizando bcrypt
  async hash(value: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(value, saltRounds);
  }

  // Implementar el método compare utilizando bcrypt
  async compare(plain: string, hashed: string): Promise<boolean> {
    if (!hashed || typeof hashed !== 'string') return false;
    return bcrypt.compare(plain, hashed);
  }
}
