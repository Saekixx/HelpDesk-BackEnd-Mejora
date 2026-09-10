import { Inject, Injectable } from '@nestjs/common';
import { OptionDto } from '@/clientes/domain/dto/user-options.dto';
import {
  AREA_REPOSITORY,
  AreaRepositoryPort,
} from '@/clientes/domain/ports/area.repository.port';

@Injectable()
export class GetAreasOptionsUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(sucursalId: number): Promise<OptionDto[]> {
    return await this.areaRepository.getAreasOptions(sucursalId);
  }
}
