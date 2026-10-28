import { AreaEntity } from '../entities/area.entity';
import { CreateAreaDto } from '../../application/dtos/create-area.dto';
import { UpdateAreaDto } from '../../application/dtos/update-area.dto';
import { FilterAreaDto } from '../../application/dtos/filter-area.dto';

export interface AreaRepositoryPort {
  findAll(filters: FilterAreaDto): Promise<{ data: AreaEntity[]; total: number }>;
  findById(id_area: number): Promise<AreaEntity | null>;
  create(dto: CreateAreaDto): Promise<AreaEntity>;
  update(id_area: number, dto: UpdateAreaDto): Promise<AreaEntity>;
  delete(id_area: number): Promise<boolean>;
  
  // Métodos para los KPIs superiores del frontend (Total Áreas, Activas, Equipos, Tickets)
  getMetrics(): Promise<{
    totalAreas: number;
    areasActivas: number;
    equiposAsignados: number;
    ticketsGenerados: number;
    nuevasEsteMes: number;
  }>;
}

export const AREA_REPOSITORY = 'AREA_REPOSITORY';