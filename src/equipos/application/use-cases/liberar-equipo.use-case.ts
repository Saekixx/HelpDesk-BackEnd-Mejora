import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';

@Injectable()
export class LiberarEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  // Desvincula al trabajador del equipo y lo deja "En_Almacen". El adaptador
  // lo hace en un único UPDATE y lanza EquipoNotFoundException si el equipo no
  // existe, así no hay ventana entre comprobar la existencia y escribir.
  async execute(id: number): Promise<void> {
    await this.equipoRepository.release(id);
  }
}
