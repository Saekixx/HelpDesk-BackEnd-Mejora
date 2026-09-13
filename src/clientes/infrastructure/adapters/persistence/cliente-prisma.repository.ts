import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  ClienteRepositoryPort,
  PaginatedClientesResult,
} from '@/clientes/domain/ports/cliente.repository.port';
import { Cliente } from '@/clientes/domain/entities/cliente.entity';
import { GetClientesFilterDto } from '@/clientes/domain/dto/get-clientes-filter.dto';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import { ClienteMapper } from './mappers/cliente.mapper';
import { Prisma } from '@prisma/client';
import { OptionDto } from '../../dtos/options.response.dto';

@Injectable()
export class ClientePrismaRepository implements ClienteRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filter: GetClientesFilterDto,
  ): Promise<PaginatedClientesResult> {
    const { page = 1, limit = 10, search, is_active } = filter;

    const where: Prisma.clientesWhereInput = {};

    if (search) {
      where.OR = [
        { nombre_principal: { contains: search } },
        { numero_documento: { contains: search } },
        { correo: { contains: search } },
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.prisma.clientes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.clientes.count({ where }),
    ]);

    return {
      data: entities.map(ClienteMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Cliente | null> {
    const entity = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!entity) return null;
    return ClienteMapper.toDomain(entity);
  }

  async existsByDocumento(numero_documento: string): Promise<boolean> {
    const count = await this.prisma.clientes.count({
      where: { numero_documento },
    });
    return count > 0;
  }

  async create(cliente: Cliente): Promise<Cliente> {
    const data = ClienteMapper.toPersistence(cliente);

    const created = await this.prisma.clientes.create({
      data: data as Prisma.clientesCreateInput,
    });
    return ClienteMapper.toDomain(created);
  }

  async update(id: number, cliente: Cliente): Promise<Cliente> {
    const exists = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!exists) throw new ClienteNotFoundException();

    // El id de ruta manda: se descarta cualquier id_cliente que venga en el payload
    const { id_cliente: _ignored, ...data } = ClienteMapper.toPersistence(
      cliente,
    );

    const updated = await this.prisma.clientes.update({
      where: { id_cliente: id },
      data,
    });
    return ClienteMapper.toDomain(updated);
  }

  async toggleStatus(id: number): Promise<Cliente> {
    const current = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!current) throw new ClienteNotFoundException();

    const updated = await this.prisma.clientes.update({
      where: { id_cliente: id },
      data: { is_active: !current.is_active },
    });
    return ClienteMapper.toDomain(updated);
  }

  async getClientesOptions(): Promise<OptionDto[]> {
    const clientes = await this.prisma.clientes.findMany({
      select: {
        id_cliente: true,
        nombre_principal: true,
      },
    });
    return clientes.map((c) => ({
      id: c.id_cliente,
      nombre: c.nombre_principal,
    }));
  }
}