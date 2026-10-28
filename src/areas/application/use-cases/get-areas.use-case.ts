import { Inject, Injectable } from '@nestjs/common';
import { AREA_REPOSITORY, AreaRepositoryPort } from '../../domain/ports/area.repository.port';
import { FilterAreaDto } from '../dtos/filter-area.dto';
import { AreaEntity } from '../../domain/entities/area.entity';

@Injectable()
export class GetAreasUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(filters: FilterAreaDto): Promise<{ data: AreaEntity[]; total: number; metrics: any }> {
    const result = await this.areaRepository.findAll(filters);
    const metrics = await this.areaRepository.getMetrics();

    return {
      data: result.data,
      total: result.total,
      metrics,
    };
  }
}