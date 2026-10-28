import { Inject, Injectable } from '@nestjs/common';
import { AREA_REPOSITORY, AreaRepositoryPort } from '../../domain/ports/area.repository.port';
import { CreateAreaDto } from '../dtos/create-area.dto';
import { AreaEntity } from '../../domain/entities/area.entity';

@Injectable()
export class CreateAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
  ) {}

  async execute(dto: CreateAreaDto): Promise<AreaEntity> {
    return this.areaRepository.create(dto);
  }
}