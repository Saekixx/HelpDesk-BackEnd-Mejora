import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { SoftwareOptionsDto } from '../dtos/get-software.dto';

@Injectable()
export class GetSoftwareUseCase {
  constructor(
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(): Promise<SoftwareOptionsDto[]> {
    return this.softwareRepository.getSoftwareOptions();
  }
}