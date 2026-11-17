import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { Equipo } from '@/equipos/domain/entities/equipo.entity';

@Injectable()
export class CambiarEstadoEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(id: number): Promise<Equipo> {
    // PATCH /equipos/:id/estado: alterna is_active sin body. El adaptador de
    // persistencia valida la existencia y lanza EquipoNotFoundException si el
    // equipo no existe.
    return await this.equipoRepository.toggleEstado(id);
  }
}
