import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenServicePort } from '../../domain/ports/token.service.port';

@Injectable()
export class JwtTokenAdapter implements TokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  // Implementación del método generateToken del puerto
  async generateToken(payload: {
    sub: string;
    email: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  // Implementación del método verifyToken del puerto
  async verifyToken(token: string): Promise<{ sub: string; email: string }> {
    return this.jwtService.verifyAsync(token);
  }
}
