import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';

@Injectable()
export class ToggleStatusEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(id: number): Promise<Equipo> {
    // El adaptador de persistencia valida existencia y lanza
    // EquipoNotFoundException si el equipo no existe.
    return await this.equipoRepository.toggleStatus(id);
  }
}