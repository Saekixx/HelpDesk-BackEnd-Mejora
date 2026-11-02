import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { HardwareNotFoundException } from '@/hardware/domain/exceptions/hardware.exceptions';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindByIdHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  // Retorna el hardware con su ubicación actual e historial de movimientos
  // (la "Hoja de Vida del Componente"). Lanza 404 si no existe.
  async execute(id: number): Promise<Hardware> {
    const hardware = await this.hardwareRepository.findById(id);
    if (!hardware) throw new HardwareNotFoundException(id);

    return hardware;
  }
}
