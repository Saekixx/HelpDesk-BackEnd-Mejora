import { User } from '../entities/user.entity.js';
import { UserFilterCriteria } from '../criteria/user-filter.criteria.js';
import { UserListItemCriteria } from '../criteria/user-list-item.criteria.js';
import { UserOptions } from '../criteria/user-options.dto.js';
import { UserSelectCriteria } from '../criteria/user-select-criteria.js';
import { UserStatsCriteria } from '../criteria/user-stats.criteria.js';

// Metadatos de paginación del listado de usuarios
export interface UserPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Resultado paginado del listado de usuarios: { data, meta }
export interface PaginatedUsersResult {
  data: UserListItemCriteria[];
  meta: UserPaginationMeta;
}

// Token único para la Inyección de Dependencias en NestJS
export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepositoryPort {
  save(user: User, zonasIds?: number[]): Promise<User>;

  // Registra varios usuarios de forma atómica: o se crean todos o no se crea ninguno
  saveMany(users: User[]): Promise<User[]>;

  findByCorreo(correo: string): Promise<User | null>;

  findById(id: number): Promise<User | null>;

  existsByCorreo(correo: string): Promise<boolean>;

  // Devuelve, en minúsculas, los correos de la lista que ya están registrados (una sola consulta)
  findExistingCorreos(correos: string[]): Promise<string[]>;

  // Método para obtener usuarios con filtros y paginación
  findAllWithFilters(
    filters: UserFilterCriteria,
  ): Promise<PaginatedUsersResult>;

  // Metodo para obtener usuarios por rol y que esten activos
  findActiveRolUsers(filters: UserSelectCriteria): Promise<UserOptions[]>;

  // Método para obtener las estadísticas generales de usuarios
  getUserStats(): Promise<UserStatsCriteria>;
}
