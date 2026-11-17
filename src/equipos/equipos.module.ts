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
import { CambiarEstadoEquipoUseCase } from './application/use-cases/cambiar-estado-equipo.use-case';
import { LiberarEquipoUseCase } from './application/use-cases/liberar-equipo.use-case';
import { AsignarEquipoUseCase } from './application/use-cases/asignar-equipo.use-case';
import { MontarComponenteStockUseCase } from './application/use-cases/montar-componente-stock.use-case';
import { RegistrarEInstalarComponenteUseCase } from './application/use-cases/registrar-e-instalar-componente.use-case';
import { ReemplazarComponenteStockUseCase } from './application/use-cases/reemplazar-componente-stock.use-case';
import { RegistrarEReemplazarComponenteUseCase } from './application/use-cases/registrar-e-reemplazar-componente.use-case';
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
    CambiarEstadoEquipoUseCase,
    LiberarEquipoUseCase,
    AsignarEquipoUseCase,
    MontarComponenteStockUseCase,
    RegistrarEInstalarComponenteUseCase,
    ReemplazarComponenteStockUseCase,
    RegistrarEReemplazarComponenteUseCase,
    {
      provide: EQUIPO_REPOSITORY,
      useClass: EquipoPrismaRepository,
    },
  ],
  exports: [EQUIPO_REPOSITORY],
})
export class EquiposModule {}
