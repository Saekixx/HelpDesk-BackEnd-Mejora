import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaRepositoryPort } from '@/clientes/domain/ports/area.repository.port';
import { AreaEntity } from '../entities/area.entity';
import { Area } from '@/clientes/domain/entities/area.entity';
import { AreaMapper } from '../mappers/area.mapper';

@Injectable()
export class AreaTypeOrmRepository implements AreaRepositoryPort {
  constructor(
    @InjectRepository(AreaEntity)
    private readonly typeOrmRepository: Repository<AreaEntity>,
  ) {}

  // Implementación del método save del puerto
  async save(area: Area): Promise<Area> {
    const persistenceEntity = AreaMapper.toPersistence(area);
    const savedEntity = await this.typeOrmRepository.save(persistenceEntity);
    return AreaMapper.toDomain(savedEntity);
  }

  // Implementación del método findById del puerto
  async findById(id: number): Promise<Area | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { id_area: id },
    });

    if (!entity) return null;

    return AreaMapper.toDomain(entity);
  }
}
