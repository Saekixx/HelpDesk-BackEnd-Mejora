import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  SucursalRepositoryPort,
  PaginatedSucursalesResult,
} from '@/clientes/domain/ports/sucursal.repository.port';
import { Sucursal } from '@/clientes/domain/entities/sucursal.entity';
import { GetSucursalesFilterDto } from '@/clientes/domain/dto/get-sucursales-filter.dto';
import { CreateSucursalDto } from '@/clientes/domain/dto/create-sucursal.dto';
import { UpdateSucursalDto } from '@/clientes/domain/dto/update-sucursal.dto';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';
import { SucursalMapper } from './mappers/sucursal.mapper';
import { Prisma } from '@prisma/client';
import { OptionDto } from '../../dtos/options.response.dto';

@Injectable()
export class SucursalPrismaRepository implements SucursalRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filters: GetSucursalesFilterDto,
  ): Promise<PaginatedSucursalesResult> {
    const { page = 1, limit = 10, search, is_active, id_cliente } = filters;

    const where: Prisma.sucursalesWhereInput = {};

    if (id_cliente !== undefined) {
      where.id_cliente = id_cliente;
    }

    if (search) {
      where.OR = [
        { nombre_sucursal: { contains: search } },
        { encargado: { contains: search } },
        { correo: { contains: search } },
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.prisma.sucursales.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.sucursales.count({ where }),
    ]);

    return {
      data: entities.map(SucursalMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Sucursal | null> {
    const entity = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: id },
    });
    if (!entity) return null;
    return SucursalMapper.toDomain(entity);
  }

  async create(data: CreateSucursalDto): Promise<Sucursal> {
    const created = await this.prisma.sucursales.create({
      data: {
        nombre_sucursal: data.nombre_sucursal,
        encargado: data.encargado,
        telefono: data.telefono,
        direccion: data.direccion,
        correo: data.correo,
        is_active: data.is_active ?? true,
        clientes: { connect: { id_cliente: data.id_cliente } },
      },
    });
    return SucursalMapper.toDomain(created);
  }

  async update(id: number, data: UpdateSucursalDto): Promise<Sucursal> {
    const exists = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: id },
    });
    if (!exists) throw new SucursalNotFoundException();

    const updated = await this.prisma.sucursales.update({
      where: { id_sucursal: id },
      data: {
        ...(data.nombre_sucursal !== undefined && {
          nombre_sucursal: data.nombre_sucursal,
        }),
        ...(data.encargado !== undefined && { encargado: data.encargado }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
        ...(data.direccion !== undefined && { direccion: data.direccion }),
        ...(data.correo !== undefined && { correo: data.correo }),
        ...(data.id_cliente !== undefined && {
          clientes: { connect: { id_cliente: data.id_cliente } },
        }),
      },
    });
    return SucursalMapper.toDomain(updated);
  }

  async toggleStatus(id: number): Promise<Sucursal> {
    const current = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: id },
    });
    if (!current) throw new SucursalNotFoundException();

    const updated = await this.prisma.sucursales.update({
      where: { id_sucursal: id },
      data: { is_active: !current.is_active },
    });
    return SucursalMapper.toDomain(updated);
  }

  async getSucursalesOptions(clienteId: number): Promise<OptionDto[]> {
    const sucursales = await this.prisma.sucursales.findMany({
      where: { id_cliente: clienteId },
      select: {
        id_sucursal: true,
        nombre_sucursal: true,
      },
    });
    return sucursales.map((s) => ({
      id: s.id_sucursal,
      nombre: s.nombre_sucursal,
    }));
  }
}