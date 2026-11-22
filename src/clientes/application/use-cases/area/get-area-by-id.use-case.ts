import { Inject, Injectable } from '@nestjs/common';
import {
  AREA_REPOSITORY,
  AreaRepositoryPort,
} from '@/clientes/domain/ports/area.repository.port';
import { AreaDetailView } from '@/clientes/domain/entities/area.entity';
import { AreaNotFoundException } from '@/clientes/domain/exceptions/area.exceptions';

@Injectable()
export class GetAreaByIdUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(id: number): Promise<AreaDetailView> {
    const area = await this.areaRepository.findById(id);
    if (!area) throw new AreaNotFoundException();
    return area;
  }
}
