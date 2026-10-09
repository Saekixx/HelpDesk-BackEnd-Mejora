import { ZonaFilterCriteria } from '../criteria/zona-filter.criteria';
import { Zona } from '../entities/zona.entity';

// Resultado de la paginación de zonas
export interface PaginatedZonasResult {
  data: Zona[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Token único para la Inyección de Dependencias en NestJS
export const ZONA_REPOSITORY = 'ZONA_REPOSITORY';

export interface ZonaRepositoryPort {
  // Método para guardar una zona
  save(zona: Zona): Promise<Zona>;

  // Método para obtener todas las zonas con filtros y paginación
  findAllWithFilters(
    filters: ZonaFilterCriteria,
  ): Promise<PaginatedZonasResult>;

  // Método para obtener una zona por su ID
  findById(id: number): Promise<Zona | null>;

  // Metodo para obtener options
  findOptions(): Promise<{ id_zona: number; nombre_zona: string }[]>;

  // Método para activar/desactivar una zona por su ID
  toggleStatus(id: number): Promise<Zona | null>;
}
