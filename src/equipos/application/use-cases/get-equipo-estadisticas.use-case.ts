import { EquipoEstadisticas } from '@/equipos/domain/entities/equipo.entity';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetEquipoEstadisticasUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  // KPI del inventario: total de equipos activos, asignados y sin asignar. No
  // recibe filtros.
  async execute(): Promise<EquipoEstadisticas> {
    return this.equipoRepository.getEstadisticas();
  }
}
