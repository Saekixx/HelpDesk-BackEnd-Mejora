import { Module } from '@nestjs/common';
import { CommonModule } from '@/common/common.module';
import { AuthModule } from '@/auth/auth.module';
import { ClientesModule } from '@/clientes/clientes.module';
import { UsuariosModule } from '@/usuarios/users.module';
import { EQUIPO_REPOSITORY } from './domain/ports/equipo.repository.port';
import { EquipoPrismaRepository } from './infrastructure/adapters/persistence/equipo-prisma.repository';
import { GetEquiposUseCase } from './application/use-cases/get-equipos.use-case';
import { GetEquipoByIdUseCase } from './application/use-cases/get-equipo-by-id.use-case';
import { CreateEquipoUseCase } from './application/use-cases/create-equipo.use-case';
import { ToggleStatusEquipoUseCase } from './application/use-cases/toggle-status-equipo.use-case';
import { LiberarEquipoUseCase } from './application/use-cases/liberar-equipo.use-case';
import { AsignarEquipoUseCase } from './application/use-cases/asignar-equipo.use-case';
import { AgregarComponenteEquipoUseCase } from './application/use-cases/agregar-componente-equipo.use-case';
import { ReemplazarComponenteEquipoUseCase } from './application/use-cases/reemplazar-componente-equipo.use-case';
import { EquipoController } from './infrastructure/controllers/equipo.controller';
import { GetEquipoOptionsUseCase } from './application/use-cases/get-equipo-options.use-case';
import { GetEquipoEstadisticasUseCase } from './application/use-cases/get-equipo-estadisticas.use-case';

@Module({
  imports: [CommonModule, AuthModule, ClientesModule, UsuariosModule],
  controllers: [EquipoController],
  providers: [
    GetEquiposUseCase,
    GetEquipoByIdUseCase,
    GetEquipoOptionsUseCase,
    GetEquipoEstadisticasUseCase,
    CreateEquipoUseCase,
    ToggleStatusEquipoUseCase,
    LiberarEquipoUseCase,
    AsignarEquipoUseCase,
    AgregarComponenteEquipoUseCase,
    ReemplazarComponenteEquipoUseCase,
    {
      provide: EQUIPO_REPOSITORY,
      useClass: EquipoPrismaRepository,
    },
  ],
  exports: [EQUIPO_REPOSITORY],
})
export class EquiposModule {}
