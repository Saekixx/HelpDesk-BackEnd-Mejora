import { Inject, Injectable } from '@nestjs/common';
import {
  AREA_REPOSITORY,
  AreaRepositoryPort,
} from '@/clientes/domain/ports/area.repository.port';
import { Area } from '@/clientes/domain/entities/area.entity';

@Injectable()
export class ToggleAreaStatusUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(id: number): Promise<Area> {
    // El adaptador de persistencia valida existencia y lanza
    // AreaNotFoundException si el área no existe.
    return await this.areaRepository.toggleStatus(id);
  }
}