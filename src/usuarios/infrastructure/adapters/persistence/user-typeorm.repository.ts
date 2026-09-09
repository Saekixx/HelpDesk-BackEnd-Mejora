import {
  PaginatedUsersResult,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { User } from '@/usuarios/domain/entities/user.entity';
import { UserMapper } from './mappers/user.mapper';
import { UserFilterCriteria } from '@/usuarios/domain/criteria/user-filter.criteria';
import { UserQueryBuilder } from './builders/user-query.builder';

@Injectable()
export class UserTypeOrmRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly typeOrmRepository: Repository<UserEntity>,
  ) {}

  // Implementación del método save del puerto
  async save(user: User): Promise<User> {
    const persistenceEntity = UserMapper.toPersistence(user);
    const savedEntity = await this.typeOrmRepository.save(persistenceEntity);
    return UserMapper.toDomain(savedEntity);
  }

  // Implementación del método findByEmail del puerto
  async findByCorreo(correo: string): Promise<User | null> {
    const entity = await this.typeOrmRepository.findOne({ where: { correo } });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  // Implementación del método findById del puerto
  async findById(id: number): Promise<User | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { id_usuario: id },
    });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  // Implementación del método existsByCorreo del puerto
  async existsByCorreo(correo: string): Promise<boolean> {
    const count = await this.typeOrmRepository.count({ where: { correo } });
    return count > 0;
  }

  // Implementación del método findAllWithFilters del puerto
  async findAllWithFilters(
    filters: UserFilterCriteria,
  ): Promise<PaginatedUsersResult> {
    const { page = 1, limit = 10 } = filters;

    const query = this.typeOrmRepository.createQueryBuilder('user');

    // Aplica los JOINs y los filtros
    UserQueryBuilder.applyFilters(query, filters);

    const skip = (page - 1) * limit;
    const [entities, total] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: entities.map(UserMapper.toResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
