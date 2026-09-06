// src/auth/domain/ports/token.service.port.ts

// Puerto para servicio de token, define la interfaz que debe implementar cualquier
// servicio de token en el dominio de autenticación.

export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenServicePort {
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
}