import { CitaSoporteFilterCriteria } from '@/citas/domain/criteria/cita-soporte-filter.criteria';
import {
  CITA_SOPORTE_REPOSITORY,
  CitaSoporteRepositoryPort,
  PaginatedCitasResult,
} from '@/citas/domain/port/cita-soporte.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetCitasUseCase {
  constructor(
    @Inject(CITA_SOPORTE_REPOSITORY)
    private readonly citaRepository: CitaSoporteRepositoryPort,
  ) {}

  async execute(
    filters: CitaSoporteFilterCriteria,
  ): Promise<PaginatedCitasResult> {
    return this.citaRepository.findAllWithFilters(filters);
  }
}
