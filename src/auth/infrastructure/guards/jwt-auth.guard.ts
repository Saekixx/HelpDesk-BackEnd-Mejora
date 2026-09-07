// src/auth/infrastructure/guards/jwt-auth.guard.ts
import {
  Inject,
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';

export interface JwtPayload {
  sub: number;
  userId: number;
  role: string;
  clienteId?: number;
  sucursalId?: number;
  nombre?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {
    super();
  }

  // Se ejecuta tras la validación de la firma del token por Passport
  handleRequest<TUser = JwtPayload>(err: any, user: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user as TUser;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Ejecutamos la validación JWT estándar de Passport (verifica firma y expiración)
    const isValidToken = await super.canActivate(context);
    if (!isValidToken) {
      return false;
    }

    // Extraemos el payload del usuario inyectado en el objeto Request
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user || !user.sub) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Verificamos el estado de la cuenta usando el Puerto del Repositorio de Usuarios
    const dbUser = await this.userRepository.findById(user.sub);

    if (!dbUser) {
      throw new UnauthorizedException('El usuario asociado al token no existe');
    }

    // Si el usuario está inactivo o suspendido, lanzamos una excepción de autorización
    if (dbUser.is_active === false) {
      throw new UnauthorizedException('Usuario inactivo o suspendido');
    }

    return true;
  }
}
