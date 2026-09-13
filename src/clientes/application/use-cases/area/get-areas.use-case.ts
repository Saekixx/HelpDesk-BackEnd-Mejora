import { Inject, Injectable } from '@nestjs/common';
import {
  AREA_REPOSITORY,
  AreaRepositoryPort,
  PaginatedAreasResult,
} from '@/clientes/domain/ports/area.repository.port';
import { GetAreasFilterDto } from '@/clientes/domain/dto/get-areas-filter.dto';

@Injectable()
export class GetAreasUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(filters: GetAreasFilterDto): Promise<PaginatedAreasResult> {
    return await this.areaRepository.findAll(filters);
  }
}