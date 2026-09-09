import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SucursalRepositoryPort } from '@/clientes/domain/ports/sucursal.repository.port';
import { SucursalEntity } from './entities/sucursal.entity';
import { Sucursal } from '@/clientes/domain/entities/sucursal.entity';
import { SucursalMapper } from './mappers/sucursal.mapper';

@Injectable()
export class SucursalTypeOrmRepository implements SucursalRepositoryPort {
  constructor(
    @InjectRepository(SucursalEntity)
    private readonly typeOrmRepository: Repository<SucursalEntity>,
  ) {}

  // Implementación del método save del puerto
  async save(sucursal: Sucursal): Promise<Sucursal> {
    const persistenceEntity = SucursalMapper.toPersistence(sucursal);
    const savedEntity = await this.typeOrmRepository.save(persistenceEntity);
    return SucursalMapper.toDomain(savedEntity);
  }

  // Implementación del método findById del puerto
  async findById(id: number): Promise<Sucursal | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { id_sucursal: id },
    });
    if (!entity) return null;
    return SucursalMapper.toDomain(entity);
  }
}
