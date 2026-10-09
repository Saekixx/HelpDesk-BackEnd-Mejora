import { forwardRef, Module } from '@nestjs/common';
import { CreateZonaUseCase } from './application/create-zona.use-case';
import { GetZonasUseCase } from './application/get-zonas.use-case';
import { GetZonaByIddUseCase } from './application/get-zona-by-id.use-case';
import { UpdateZonaUseCase } from './application/update-zona.use-case';
import { ToggleZonaStatusUseCase } from './application/toggle-zona-status.use-case';
import { ZonasController } from './infrastructure/controllers/zonas.controller';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@/common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@/auth/auth.module';
import { ZONA_REPOSITORY } from './domain/ports/zona.repository.port';
import { ZonaPrismaRepository } from './infrastructure/adapters/persistence/zona-prisma.repository';
import { GetZonaOptionsUseCase } from './application/get-zona-options.use-case';

@Module({
  imports: [
    ConfigModule,
    CommonModule, // Se encarga de proveer PrismaService
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [ZonasController],
  providers: [
    // Casos de Uso
    CreateZonaUseCase,
    GetZonasUseCase,
    GetZonaOptionsUseCase,
    GetZonaByIddUseCase,
    UpdateZonaUseCase,
    ToggleZonaStatusUseCase,

    // Mapeo de Puertos a Implementaciones de Prisma
    {
      provide: ZONA_REPOSITORY,
      useClass: ZonaPrismaRepository,
    },
  ],
  exports: [ZONA_REPOSITORY],
})
export class ZonasModule {}
