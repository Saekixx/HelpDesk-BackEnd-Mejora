import { User } from '../entities/user.entity.js';

// Token único para la Inyección de Dependencias en NestJS
export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepositoryPort {
  save(user: User): Promise<User>;

  findByCorreo(correo: string): Promise<User | null>;

  findById(id: number): Promise<User | null>;

  existsByCorreo(correo: string): Promise<boolean>;
}
