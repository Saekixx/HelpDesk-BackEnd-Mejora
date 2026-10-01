import { SoftwareOptionDto } from '../dtos/get-software.dto';
import { Software } from '../entities/software.entity';

export const SOFTWARE_REPOSITORY = 'SOFTWARE_REPOSITORY';

export interface SoftwareRepositoryPort {
  save(software: Software): Promise<Software>;

  findAll(): Promise<Software[]>;

  findById(id: number): Promise<Software | null>;

  getSoftwareOptions(): Promise<SoftwareOptionDto[]>;
}