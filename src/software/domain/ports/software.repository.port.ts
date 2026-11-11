import { Software } from '../entities/software.entity';
import { SoftwareOptionDto } from '../dtos/get-software.dto';
import { FilterSoftwareDto } from '../../application/dtos/filter-software.dto';
import { SoftwareVaultResponseDto } from '../dtos/get-software-equipos.dto';

export const SOFTWARE_REPOSITORY = 'SOFTWARE_REPOSITORY';

export interface SoftwareRepositoryPort {
  save(software: Software): Promise<Software>;

  findAll(filterDto: FilterSoftwareDto): Promise<{
    data: Software[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;

  findById(id: number): Promise<Software | null>;

  getSoftwareOptions(): Promise<SoftwareOptionDto[]>;

  // Metodo para traer el detalle de un software junto con los equipos asociados
  findSoftwareVaultById(id: number): Promise<SoftwareVaultResponseDto>;
}
