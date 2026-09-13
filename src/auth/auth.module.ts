import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

// Casos de uso
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';

// Constantes / Tokens de Inyección
import { TOKEN_SERVICE } from './domain/ports/token.service.port';
import { HASH_SERVICE } from './domain/ports/hash.service.port';

// Adaptadores
import { JwtTokenAdapter } from './infrastructure/adapters/jwt-token.adapter';
import { BcryptHashAdapter } from './infrastructure/adapters/bcrypt-hash.adapter';

// Controladores, Estrategias y Guards
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UsuariosModule } from '../usuarios/users.module';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RoleGuard } from './infrastructure/guards/role.guard';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { ConfirmRegisterUseCase } from './application/use-cases/confirm-register.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    MailModule, // Se encarga de proveer MailerService
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configuración de Passport para usar JWT como estrategia por defecto
    forwardRef(() => UsuariosModule),
    JwtModule.registerAsync({
      // Configuración asíncrona del módulo JWT para permitir la inyección de dependencias
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
    // Casos de uso
    LoginUseCase,
    RegisterUseCase,
    ConfirmRegisterUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,

    // Guardias y Estrategias
    JwtAuthGuard, // Guard de autenticación JWT que valida la firma y expiración del token, y verifica el estado del usuario en la base de datos
    RoleGuard, // Guard de autorización basada en roles que verifica si el usuario tiene el rol requerido para acceder a un recurso
    JwtStrategy, // Estrategia de Passport que valida la firma y expiración del token JWT, y mapea el payload a un objeto JwtPayload que se inyectará en req.user

    // Adaptadores de servicios
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenAdapter,
    },
    {
      provide: HASH_SERVICE,
      useClass: BcryptHashAdapter,
    },
  ],
  exports: [
    HASH_SERVICE,
    TOKEN_SERVICE,
    JwtAuthGuard,
    RoleGuard,
    // Re-exportamos el módulo completo (no un token suelto): Nest solo
    // permite exportar providers/módulos que el propio AuthModule tiene
    // en sus `imports`. Como UsuariosModule ya exporta USER_REPOSITORY,
    // re-exportar el módulo hace que ese token (y el resto de sus
    // exports) queden disponibles para quien importe AuthModule
    // (p. ej. ClientesModule, que lo necesita para JwtAuthGuard).
    forwardRef(() => UsuariosModule),
  ],
})
export class AuthModule {}