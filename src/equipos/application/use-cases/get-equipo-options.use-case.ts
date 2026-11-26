import { GetEquipoOptionsFilterDto } from '@/equipos/domain/dto/get-equipo-options-filter.dto';
import { EquipoOptionItem } from '@/equipos/domain/entities/equipo.entity';
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

  // Opciones ligeras de equipos activos para selectores en cascada. Los filtros
  // son opcionales y se aplican en el repositorio.
  async execute(
<<<<<<< HEAD
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
=======
    filters?: GetEquipoOptionsFilterDto,
  ): Promise<EquipoOptionItem[]> {
    return this.equipoRepository.getEquipoOptions(filters);
>>>>>>> origin/giovanni
  }
}
