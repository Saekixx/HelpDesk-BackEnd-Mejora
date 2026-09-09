import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { ClienteRepositoryPort } from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';
import { ClienteMapper } from './mappers/cliente.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientePrismaRepository implements ClienteRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(cliente: Cliente): Promise<Cliente> {
    const data = ClienteMapper.toPersistence(cliente);

    if (cliente.id_cliente) {
      const updated = await this.prisma.clientes.update({
        where: { id_cliente: cliente.id_cliente },
        data,
      });
      return ClienteMapper.toDomain(updated);
    }

    const created = await this.prisma.clientes.create({
      data: data as Prisma.clientesCreateInput,
    });
    return ClienteMapper.toDomain(created);
  }

  async findById(id: number): Promise<Cliente | null> {
    const entity = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!entity) return null;
    return ClienteMapper.toDomain(entity);
  }
}
