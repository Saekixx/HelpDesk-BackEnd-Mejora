import { Inject, Injectable } from '@nestjs/common';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { FilterSoftwareDto } from '../dtos/filter-software.dto';

@Injectable()
export class FindAllSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(filterDto: FilterSoftwareDto) {
    return this.softwareRepository.findAll(filterDto);
  }
}