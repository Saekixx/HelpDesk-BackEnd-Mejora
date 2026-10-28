import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { AreaRepositoryPort } from '../../../domain/ports/area.repository.port';
import { AreaEntity } from '../../../domain/entities/area.entity';
import { CreateAreaDto } from '../../../application/dtos/create-area.dto';
import { UpdateAreaDto } from '../../../application/dtos/update-area.dto';
import { FilterAreaDto } from '../../../application/dtos/filter-area.dto';
import { AreaMapper } from './mappers/area.mapper';

@Injectable()
export class AreaPrismaRepository extends PrismaClient implements AreaRepositoryPort {
  async findAll(filters: FilterAreaDto): Promise<{ data: AreaEntity[]; total: number }> {
    const { search, id_empresa, id_sucursal, is_active, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.areaWhereInput = {};

    if (id_sucursal) {
      where.id_sucursal = Number(id_sucursal);
    }

    if (id_empresa) {
      where.sucursales = {
        id_cliente: Number(id_empresa),
      };
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (search) {
      where.OR = [
        { nombre_area: { contains: search } },
        { sucursales: { nombre_sucursal: { contains: search } } },
        { sucursales: { clientes: { nombre_principal: { contains: search } } } },
      ];
    }

    const [rawAreas, total] = await Promise.all([
      this.area.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          sucursales: {
            include: {
              clientes: true,
            },
          },
          _count: {
            select: {
              equipos: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.area.count({ where }),
    ]);

    return {
      data: rawAreas.map((area) => AreaMapper.toDomain(area)),
      total,
    };
  }

  async findById(id_area: number): Promise<AreaEntity | null> {
    const rawArea = await this.area.findUnique({
      where: { id_area },
      include: {
        sucursales: {
          include: {
            clientes: true,
          },
        },
        _count: {
          select: {
            equipos: true,
          },
        },
      },
    });

    if (!rawArea) return null;
    return AreaMapper.toDomain(rawArea);
  }

  async create(dto: CreateAreaDto): Promise<AreaEntity> {
    const rawArea = await this.area.create({
      data: {
        nombre_area: dto.nombre_area,
        id_sucursal: Number(dto.id_sucursal),
        contacto: dto.contacto_responsable ?? '',
        telefono: dto.telefono ?? '',
        correo: dto.correo_electronico ?? '',
        is_active: true,
      },
      include: {
        sucursales: {
          include: {
            clientes: true,
          },
        },
        _count: {
          select: {
            equipos: true,
          },
        },
      },
    });

    return AreaMapper.toDomain(rawArea);
  }

  async update(id_area: number, dto: UpdateAreaDto): Promise<AreaEntity> {
    const exists = await this.area.findUnique({ where: { id_area } });
    if (!exists) {
      throw new NotFoundException(`El área con ID ${id_area} no fue encontrada`);
    }

    const rawArea = await this.area.update({
      where: { id_area },
      data: {
        ...(dto.nombre_area && { nombre_area: dto.nombre_area }),
        ...(dto.id_sucursal && { id_sucursal: dto.id_sucursal }),
        ...(dto.contacto_responsable !== undefined && { contacto: dto.contacto_responsable }),
        ...(dto.telefono !== undefined && { telefono: dto.telefono }),
        ...(dto.correo_electronico !== undefined && { correo: dto.correo_electronico }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
      include: {
        sucursales: {
          include: {
            clientes: true,
          },
        },
        _count: {
          select: {
            equipos: true,
          },
        },
      },
    });

    return AreaMapper.toDomain(rawArea);
  }

  async delete(id_area: number): Promise<boolean> {
    const exists = await this.area.findUnique({ where: { id_area } });
    if (!exists) {
      throw new NotFoundException(`El área con ID ${id_area} no fue encontrada`);
    }

    await this.area.update({
      where: { id_area },
      data: { is_active: false },
    });

    return true;
  }

  async getMetrics(): Promise<{
    totalAreas: number;
    areasActivas: number;
    equiposAsignados: number;
    ticketsGenerados: number;
    nuevasEsteMes: number;
  }> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalAreas, areasActivas, nuevasEsteMes, equiposCount] = await Promise.all([
      this.area.count(),
      this.area.count({ where: { is_active: true } }),
      this.area.count({
        where: {
          created_at: {
            gte: firstDayOfMonth,
          },
        },
      }),
      this.equipos.count(),
    ]);

    return {
      totalAreas,
      areasActivas,
      equiposAsignados: equiposCount,
      ticketsGenerados: 0,
      nuevasEsteMes,
    };
  }
}