import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AREA_REPOSITORY, AreaRepositoryPort } from '../../domain/ports/area.repository.port';
import { AreaEntity } from '../../domain/entities/area.entity';

@Injectable()
export class ToggleAreaStatusUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(id_area: number): Promise<AreaEntity> {
    const area = await this.areaRepository.findById(id_area);
    if (!area) {
      throw new NotFoundException(`El área con ID ${id_area} no fue encontrada`);
    }

    // Alterna el estado actual (si está activo pasa a inactivo, y viceversa)
    const nuevoEstado = !area.is_active;

    return this.areaRepository.update(id_area, { is_active: nuevoEstado });
  }
}