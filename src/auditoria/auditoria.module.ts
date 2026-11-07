import { AuthModule } from '@/auth/auth.module';
import { CommonModule } from '@/common/common.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuditoriaController } from './infrastructure/controller/auditoria.controller';
import { AUDITORIA_REPOSITORY } from './domain/port/auditoria.repository.port';
import { PrismaAuditoriaRepository } from './infrastructure/adapter/persistence/prisma-auditoria.repository';
import { RegisterCloseAuditUseCase } from './application/use-case/register-close-audit.use-case';
import { RegisterReopeningAuditUseCase } from './application/use-case/register-reopening-audit.use-case';
import { RegisterEsperaRepuestoAuditUseCase } from './application/use-case/register-espera-repuesto-audit.use-case';

const USE_CASES = [
  RegisterCloseAuditUseCase,
  RegisterReopeningAuditUseCase,
  RegisterEsperaRepuestoAuditUseCase,
];

@Module({
  imports: [
    ConfigModule,
    CommonModule, // Se encarga de proveer PrismaService
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [AuditoriaController],
  providers: [
    // Casos de Uso
    ...USE_CASES,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: PrismaAuditoriaRepository,
    },
  ],
  exports: [AUDITORIA_REPOSITORY, ...USE_CASES], // Exportamos el puerto para que otros módulos puedan inyectarlo
})
export class AuditoriaModule {}
