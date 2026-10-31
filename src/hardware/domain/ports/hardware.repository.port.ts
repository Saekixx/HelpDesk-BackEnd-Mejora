import { Hardware } from '../entities/hardware.entity';
import { HardwareOptionDto } from '../dtos/get-hardware.dto';
import { FilterHardwareDto } from '../../application/dtos/filter-hardware.dto';

export const HARDWARE_REPOSITORY = 'HARDWARE_REPOSITORY';

export interface HardwareRepositoryPort {
  /**
   * Registra un hardware nuevo. Si trae `id_equipo_actual` crea, en la misma
   * transacción, el registro activo en `registro_hardware`.
   */
  create(hardware: Hardware): Promise<Hardware>;
  update(hardware: Hardware): Promise<Hardware>;
  existeEquipo(id_equipo: number): Promise<boolean>;
  findAll(filterDto: FilterHardwareDto): Promise<{
    data: Hardware[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  findById(id: number): Promise<Hardware | null>;
  getHardwareOptions(): Promise<HardwareOptionDto[]>;
}
