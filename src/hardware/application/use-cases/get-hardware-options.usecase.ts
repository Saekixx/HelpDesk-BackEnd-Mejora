import { Inject, Injectable } from '@nestjs/common';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { GetHardwareOptionsQueryDto } from '../dtos/get-hardware-options.query.dto';
import { HardwareOptionResponseDto } from '../dtos/hardware-option-response.dto';

@Injectable()
export class GetHardwareOptionsUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(
    filters: GetHardwareOptionsQueryDto,
  ): Promise<HardwareOptionResponseDto[]> {
    return this.hardwareRepository.findOptions(filters);
  }
}
