import { User } from '../entities/user.entity.js';
import { UserFilterCriteria } from '../criteria/user-filter.criteria.js';
import { UserResponseCriteria } from '../criteria/user-response.criteria.js';

// Resultado de la paginación de usuarios
export interface PaginatedUsersResult {
  data: UserResponseCriteria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Token único para la Inyección de Dependencias en NestJS
export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepositoryPort {
  save(user: User): Promise<User>;

  findByCorreo(correo: string): Promise<User | null>;

  findById(id: number): Promise<User | null>;

  existsByCorreo(correo: string): Promise<boolean>;

  // Método para obtener usuarios con filtros y paginación
  findAllWithFilters(
    filters: UserFilterCriteria,
  ): Promise<PaginatedUsersResult>;
}
