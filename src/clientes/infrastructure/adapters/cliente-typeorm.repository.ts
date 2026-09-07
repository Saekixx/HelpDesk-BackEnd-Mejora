import { Injectable } from '@nestjs/common';
import { ClienteEntity } from '../entities/cliente.entity';
import { Repository } from 'typeorm';
import { ClienteRepositoryPort } from '@/clientes/domain/ports/cliente.repository.port';
import { InjectRepository } from '@nestjs/typeorm';
import { ClienteMapper } from '../mappers/cliente.mapper';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';

@Injectable()
export class ClienteTypeOrmRepository implements ClienteRepositoryPort {
  constructor(
    @InjectRepository(ClienteEntity)
    private readonly typeOrmRepository: Repository<ClienteEntity>,
  ) {}

  // Implementación del método save del puerto
  async save(cliente: Cliente): Promise<Cliente> {
    const persistenceEntity = ClienteMapper.toPersistence(cliente);
    const savedEntity = await this.typeOrmRepository.save(persistenceEntity);
    return ClienteMapper.toDomain(savedEntity);
  }

  // Implementación del método findById del puerto
  async findById(id: number): Promise<Cliente | null> {
    const entity = await this.typeOrmRepository.findOne({
      where: { id_cliente: id },
    });

    if (!entity) return null;

    return ClienteMapper.toDomain(entity);
  }
}
