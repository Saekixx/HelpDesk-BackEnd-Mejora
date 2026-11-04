import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetEquipoOptionsUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(
    id_area?: number,
  ): Promise<{ id_equipo: number; nombre_equipo: string }[]> {
    return this.equipoRepository.getEquipoOptions(id_area);
  }
}
