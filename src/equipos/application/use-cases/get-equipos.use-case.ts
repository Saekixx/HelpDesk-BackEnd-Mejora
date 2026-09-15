import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
  PaginatedEquiposResult,
} from '@/equipos/domain/ports/equipo.repository.port';
import { GetEquiposFilterDto } from '@/equipos/domain/dto/get-equipos-filter.dto';

@Injectable()
export class GetEquiposUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  async execute(
    filter: GetEquiposFilterDto,
  ): Promise<PaginatedEquiposResult> {
    const normalizedFilter: GetEquiposFilterDto = {
      ...filter,
      page: filter.page ?? 1,
      limit: filter.limit ?? 10,
    };
    return await this.equipoRepository.findAll(normalizedFilter);
  }
}