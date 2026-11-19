// src/modules/auditoria/auditoria.module.ts
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
import { RegisterDerivationAuditUseCase } from './application/use-case/register-derivation-audit.use-case';
import { AuditoriaContextResolver } from './application/service/auditoria-context.resolver';
import { CitasModule } from '@/citas/citas.module';

const USE_CASES = [
  RegisterCloseAuditUseCase,
  RegisterReopeningAuditUseCase,
  RegisterEsperaRepuestoAuditUseCase,
  RegisterDerivationAuditUseCase,
];

@Module({
  imports: [
    ConfigModule,
    CommonModule, // Se encarga de proveer PrismaService
    forwardRef(() => CitasModule), // Se encarga de proveer CitaSoporteRepositoryPort[cite: 25]
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [AuditoriaController],
  providers: [
    // Servicios de contexto
    AuditoriaContextResolver, // <-- 2. Registrar aquí para que los casos de uso lo resuelvan

    // Casos de Uso
    ...USE_CASES,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: AUDITORIA_REPOSITORY,
      useClass: PrismaAuditoriaRepository,
    },
  ],
  exports: [AUDITORIA_REPOSITORY, ...USE_CASES],
})
export class AuditoriaModule {}
