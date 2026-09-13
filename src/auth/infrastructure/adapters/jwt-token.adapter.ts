import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, TokenServicePort } from '../../domain/ports/token.service.port';

@Injectable()
export class JwtTokenAdapter implements TokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  // Implementación del método generateToken del puerto
  async generateToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  // Implementación del método verifyToken del puerto
  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }
}