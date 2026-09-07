import { PlanRepositoryPort } from '@/planes/domain/ports/plan.repository.port';
import { PlanEntity } from '../entities/plan.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanMapper } from '../mappers/plan.mapper';
import { Plan } from '@/planes/domain/entities/plan.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanTypeOrmRepository implements PlanRepositoryPort {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly typeOrmRepository: Repository<PlanEntity>,
  ) {}

  // Implementación del método save del puerto
  async save(plan: Plan): Promise<Plan> {
    const persistenceEntity = PlanMapper.toPersistence(plan);
    const savedEntity = await this.typeOrmRepository.save(persistenceEntity);
    return PlanMapper.toDomain(savedEntity);
  }

  // Implementación del método findById del puerto
  async findById(id: number): Promise<Plan | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { id_plan: id },
    });
    if (!entity) return null;
    return PlanMapper.toDomain(entity);
  }
}
