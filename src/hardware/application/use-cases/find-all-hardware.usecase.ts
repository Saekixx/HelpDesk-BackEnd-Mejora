import { Inject, Injectable } from '@nestjs/common';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { FilterHardwareDto } from '../dtos/filter-hardware.dto';

@Injectable()
export class FindAllHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(filterDto: FilterHardwareDto) {
    return this.hardwareRepository.findAll(filterDto);
  }
}