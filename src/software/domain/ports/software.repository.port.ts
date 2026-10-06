import { Software } from '../entities/software.entity';
import { SoftwareOptionDto } from '../dtos/get-software.dto';
import { FilterSoftwareDto } from '../../application/dtos/filter-software.dto';

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
}