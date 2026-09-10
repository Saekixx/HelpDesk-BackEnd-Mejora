import { OptionDto } from '../dto/user-options.dto';
import { Area } from '../entities/area.entity';

export const AREA_REPOSITORY = 'AREA_REPOSITORY';

export interface AreaRepositoryPort {
  save(area: Area): Promise<Area>;

  findById(id: number): Promise<Area | null>;

  getAreasOptions(sucursalId: number): Promise<OptionDto[]>;
}
