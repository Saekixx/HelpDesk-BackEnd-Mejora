import { Inject, Injectable } from '@nestjs/common';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { FilterHardwareDto } from '../dtos/filter-hardware.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class FindAllHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(filterDto: FilterHardwareDto) {
    return this.hardwareRepository.findAll(this.normalize(filterDto));
  }

  /**
   * Limpia los filtros antes de llegar al repositorio: recorta espacios,
   * descarta textos vacíos y asegura valores de paginación por defecto.
   */
  private normalize(filterDto: FilterHardwareDto): FilterHardwareDto {
    return {
      ...filterDto,
      search: this.cleanText(filterDto.search),
      tipo_componente: this.cleanText(filterDto.tipo_componente),
      proveedor: this.cleanText(filterDto.proveedor),
      page: filterDto.page ?? DEFAULT_PAGE,
      limit: filterDto.limit ?? DEFAULT_LIMIT,
    };
  }

  private cleanText(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
