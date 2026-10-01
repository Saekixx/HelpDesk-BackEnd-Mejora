import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { HardwareOptionsDto } from '../dtos/get-hardware.dto';

@Injectable()
export class GetHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(): Promise<HardwareOptionsDto[]> {
    return this.hardwareRepository.getHardwareOptions();
  }
}