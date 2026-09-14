import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  AreaRepositoryPort,
  PaginatedAreasResult,
} from '@/clientes/domain/ports/area.repository.port';
import { Area } from '@/clientes/domain/entities/area.entity';
import { GetAreasFilterDto } from '@/clientes/domain/dto/get-areas-filter.dto';
import { CreateAreaDto } from '@/clientes/domain/dto/create-area.dto';
import { UpdateAreaDto } from '@/clientes/domain/dto/update-area.dto';
import { AreaNotFoundException } from '@/clientes/domain/exceptions/area.exceptions';
import { AreaMapper } from './mappers/area.mapper';
import { Prisma } from '@prisma/client';
import { OptionDto } from '../../dtos/options.response.dto';

@Injectable()
export class AreaPrismaRepository implements AreaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: GetAreasFilterDto): Promise<PaginatedAreasResult> {
    const {
      page = 1,
      limit = 10,
      search,
      is_active,
      id_sucursal,
      id_cliente,
    } = filters;

    const where: Prisma.areaWhereInput = {};

    if (id_sucursal !== undefined) {
      where.id_sucursal = id_sucursal;
    }

    if (id_cliente !== undefined) {
      where.sucursales = { id_cliente };
    }

    if (search) {
      where.OR = [
        { nombre_area: { contains: search } },
        { contacto: { contains: search } },
        { correo: { contains: search } },
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.prisma.area.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          sucursales: {
            select: {
              id_sucursal: true,
              nombre_sucursal: true,
              clientes: {
                select: { id_cliente: true, nombre_principal: true },
              },
            },
          },
        },
      }),
      this.prisma.area.count({ where }),
    ]);

    return {
      data: entities.map(AreaMapper.toListItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Area | null> {
    const entity = await this.prisma.area.findUnique({
      where: { id_area: id },
    });
    if (!entity) return null;
    return AreaMapper.toDomain(entity);
  }

  async create(data: CreateAreaDto): Promise<Area> {
    const created = await this.prisma.area.create({
      data: {
        nombre_area: data.nombre_area,
        contacto: data.contacto,
        telefono: data.telefono,
        correo: data.correo,
        is_active: data.is_active ?? true,
        sucursales: { connect: { id_sucursal: data.id_sucursal } },
      },
    });
    return AreaMapper.toDomain(created);
  }

  async update(id: number, data: UpdateAreaDto): Promise<Area> {
    const exists = await this.prisma.area.findUnique({
      where: { id_area: id },
    });
    if (!exists) throw new AreaNotFoundException();

    const updated = await this.prisma.area.update({
      where: { id_area: id },
      data: {
        ...(data.nombre_area !== undefined && {
          nombre_area: data.nombre_area,
        }),
        ...(data.contacto !== undefined && { contacto: data.contacto }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
        ...(data.correo !== undefined && { correo: data.correo }),
        ...(data.id_sucursal !== undefined && {
          sucursales: { connect: { id_sucursal: data.id_sucursal } },
        }),
      },
    });
    return AreaMapper.toDomain(updated);
  }

  async toggleStatus(id: number): Promise<Area> {
    const current = await this.prisma.area.findUnique({
      where: { id_area: id },
    });
    if (!current) throw new AreaNotFoundException();

    const updated = await this.prisma.area.update({
      where: { id_area: id },
      data: { is_active: !current.is_active },
    });
    return AreaMapper.toDomain(updated);
  }

  async getAreasOptions(sucursalId: number): Promise<OptionDto[]> {
    const areas = await this.prisma.area.findMany({
      where: { id_sucursal: sucursalId },
      select: {
        id_area: true,
        nombre_area: true,
      },
    });
    return areas.map((a) => ({
      id: a.id_area,
      nombre: a.nombre_area,
    }));
  }
}