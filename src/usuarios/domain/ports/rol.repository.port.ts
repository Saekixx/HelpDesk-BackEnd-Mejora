import { Rol } from '../entities/rol.entity';

// Token unico para la Inyección de Dependencias en NestJS
export const ROL_REPOSITORY = 'ROL_REPOSITORY';

export interface RolRepositoryPort {
  findAll(): Promise<Rol[]>;

  findById(id: number): Promise<Rol | null>;
}
