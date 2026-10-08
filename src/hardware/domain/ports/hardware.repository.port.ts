import { Hardware } from '../entities/hardware.entity';
import { HardwareOptionDto } from '../dtos/get-hardware.dto';
import { FilterHardwareDto } from '../../application/dtos/filter-hardware.dto';

export const HARDWARE_REPOSITORY = 'HARDWARE_REPOSITORY';

export interface HardwareRepositoryPort {
  save(hardware: Hardware): Promise<Hardware>;
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