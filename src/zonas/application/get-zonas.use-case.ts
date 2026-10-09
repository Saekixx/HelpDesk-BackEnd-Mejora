import { Inject, Injectable } from '@nestjs/common';
import {
  PaginatedZonasResult,
  ZONA_REPOSITORY,
  ZonaRepositoryPort,
} from '../domain/ports/zona.repository.port';
import { ZonaFilterCriteria } from '../domain/criteria/zona-filter.criteria';

@Injectable()
export class GetZonasUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY)
    private readonly zonaRepository: ZonaRepositoryPort,
  ) {}

  async execute(filters: ZonaFilterCriteria): Promise<PaginatedZonasResult> {
    return await this.zonaRepository.findAllWithFilters(filters);
  }
}
