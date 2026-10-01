import { Software } from '@/software/domain/entities/software.entity';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByIdSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(id: number): Promise<Software | null> {
    return this.softwareRepository.findById(id);
  }
}