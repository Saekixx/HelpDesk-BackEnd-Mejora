import { Inject, Injectable } from '@nestjs/common';
import { AREA_REPOSITORY, AreaRepositoryPort } from '../../domain/ports/area.repository.port';
import { UpdateAreaDto } from '../dtos/update-area.dto';
import { AreaEntity } from '../../domain/entities/area.entity';

@Injectable()
export class UpdateAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(id_area: number, dto: UpdateAreaDto): Promise<AreaEntity> {
    return this.areaRepository.update(id_area, dto);
  }
}