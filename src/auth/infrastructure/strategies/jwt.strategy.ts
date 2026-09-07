// src/auth/infrastructure/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../guards/jwt-auth.guard';

// Estrategia de autenticación JWT de Passport. Se encarga de validar la firma y la expiración del token JWT,
// y de mapear el payload a un objeto JwtPayload que se inyectará en req.user.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'secretKeySuperSegura',
    });
  }

  // AQUÍ ES DONDE SE MAPEA Y CONSTRUYE EL REQ.USER
  async validate(payload: any): Promise<JwtPayload> {
    return {
      userId: payload.sub,
      sub: payload.sub,
      role: payload.role,
      clienteId: payload.clienteId,
      sucursalId: payload.sucursalId,
      nombre: payload.nombre,
    };
  }
}
