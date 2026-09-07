import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '@/usuarios/domain/entities/rol.entity';
import { RolRepositoryPort } from '@/usuarios/domain/ports/rol.repository.port';
import { RolEntity } from './entities/rol.entity';
import { RolMapper } from './mappers/rol.mapper';

@Injectable()
export class RolTypeOrmRepository implements RolRepositoryPort {
  constructor(
    @InjectRepository(RolEntity)
    private readonly typeOrmRepository: Repository<RolEntity>,
  ) {}

  // Implementación del método findById del puerto
  async findById(id: number): Promise<Rol | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { id_rol: id },
    });
    if (!entity) return null;
    return RolMapper.toDomain(entity);
  }
}
