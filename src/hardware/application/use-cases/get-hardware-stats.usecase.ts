import { Inject, Injectable } from '@nestjs/common';
import {
  HARDWARE_REPOSITORY,
  HardwareEstadisticas,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';

@Injectable()
export class GetHardwareStatsUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  // Retorna los conteos de componentes por estado y su total. Es de solo
  // lectura y no recibe filtros: siempre resume todo el inventario.
  // La conversión a la estructura plana de la respuesta HTTP
  // (`HardwareStatsResponseDto`) la hace `HardwareMapper.toStatsResponse` en
  // el controlador, igual que el resto de endpoints del módulo.
  async execute(): Promise<HardwareEstadisticas> {
    return this.hardwareRepository.getEstadisticas();
  }
}
