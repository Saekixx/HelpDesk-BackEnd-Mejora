import { User } from '../entities/user.entity.js';
import { UserFilterCriteria } from '../criteria/user-filter.criteria.js';
import { UserResponseCriteria } from '../criteria/user-response.criteria.js';
import { UserOptions } from '../criteria/user-options.dto.js';
import { UserSelectCriteria } from '../criteria/user-select-criteria.js';
import { UserStatsCriteria } from '../criteria/user-stats.criteria.js';
import { UserRole } from '../enum/user-role.enum.js';

// Resultado de la paginación de usuarios
export interface PaginatedUsersResult {
  data: UserResponseCriteria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Resultado de la carga de trabajo de un técnico
export interface TechnicianWorkload {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  carga_actual: number; // Número de tickets activos ('Asignado' o 'En_Progreso')
}

// Token único para la Inyección de Dependencias en NestJS
export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepositoryPort {
  save(user: User, zonasIds?: number[]): Promise<User>;

  findByCorreo(correo: string): Promise<User | null>;

  findById(id: number): Promise<User | null>;

  existsByCorreo(correo: string): Promise<boolean>;

  // Método para obtener usuarios con filtros y paginación
  findAllWithFilters(
    filters: UserFilterCriteria,
  ): Promise<PaginatedUsersResult>;

  // Metodo para obtener usuarios por rol y que esten activos
  findActiveRolUsers(filters: UserSelectCriteria): Promise<UserOptions[]>;

  // Método para obtener técnicos remotos con su carga de trabajo
  findRemoteTechniciansWithWorkload(
    role: UserRole.SOPORTE_TECNICO,
  ): Promise<TechnicianWorkload[]>;

  // Método para obtener técnicos in-situ por zona y con su carga de trabajo
  findInsituTechniciansByZoneAndWorkload(
    idZona: number,
    role: UserRole.SOPORTE_INSITU,
  ): Promise<TechnicianWorkload[]>;

  // Método para obtener las estadísticas generales de usuarios
  getUserStats(): Promise<UserStatsCriteria>;
}
