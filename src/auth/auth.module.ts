import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Casos de uso
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';

// Constantes / Tokens de Inyección
import { TOKEN_SERVICE } from './domain/ports/token.service.port';
import { HASH_SERVICE } from './domain/ports/hash.service.port';

// Adaptadores
import { JwtTokenAdapter } from './infrastructure/adapters/jwt-token.adapter';
import { BcryptHashAdapter } from './infrastructure/adapters/bcrypt-hash.adapter';

// Controladores y Módulos requeridos
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UsuariosModule } from '../usuarios/users.module';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

@Module({
  imports: [
    forwardRef(() => UsuariosModule), // Importamos el módulo de usuarios para poder inyectar los repositorios de usuarios y roles
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'secretKeySuperSegura',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    JwtAuthGuard, // Agregamos el guardia de autenticación JWT como proveedor para que pueda ser inyectado en otros lugares si es necesario
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenAdapter,
    },
    {
      provide: HASH_SERVICE,
      useClass: BcryptHashAdapter,
    },
  ],
  // Exportamos los servicios de hash y token para que puedan ser utilizados en otros módulos, como UsuariosModule
  exports: [HASH_SERVICE, TOKEN_SERVICE],
})
export class AuthModule {}
