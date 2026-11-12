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
    id_trabajador?: number,
  ): Promise<{ id_equipo: number; nombre_equipo: string }[]> {
    const criteriaArea = id_area ? Number(id_area) : undefined;
    const criteriaTrabajador =
      !criteriaArea && id_trabajador ? Number(id_trabajador) : undefined;

    return this.equipoRepository.getEquipoOptions(
      criteriaArea,
      criteriaTrabajador,
    );
  }
}
