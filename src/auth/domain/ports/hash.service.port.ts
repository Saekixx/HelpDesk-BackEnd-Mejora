// src/auth/domain/ports/hash.service.port.ts

// Puerto para servicio de hash, define la interfaz que debe implementar cualquier
// servicio de hash en el dominio de autenticación.

export const HASH_SERVICE = 'HASH_SERVICE';

export interface HashServicePort {
  hash(payload: string): Promise<string>;
  compare(payload: string, hashed: string): Promise<boolean>;
}
