import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { SoftwareRepositoryPort } from '@/software/domain/ports/software.repository.port';
import { Software } from '@/software/domain/entities/software.entity';
import { SoftwareMapper } from './mappers/software.mapper';
import { Prisma } from '@prisma/client';
import { SoftwareOptionDto } from '@/software/domain/dtos/get-software.dto';
import { FilterSoftwareDto } from '@/software/application/dtos/filter-software.dto';

@Injectable()
export class SoftwarePrismaRepository implements SoftwareRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(software: Software): Promise<Software> {
    const data = SoftwareMapper.toPersistence(software);

    if (software.id_software) {
      const updated = await this.prisma.software.update({
        where: { idSoftware: software.id_software },
        data,
      });
      return SoftwareMapper.toDomain(updated);
    }

    const created = await this.prisma.software.create({
      data: data as Prisma.SoftwareCreateInput,
    });
    return SoftwareMapper.toDomain(created);
  }

  async findAll(filterDto: FilterSoftwareDto): Promise<{
    data: Software[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { search, is_active, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where: Prisma.SoftwareWhereInput = {};

    if (search) {
      where.OR = [
        { nombreSoftware: { contains: search } },
        { proveedor: { contains: search } },
      ];
    }

    if (is_active !== undefined) {
      where.isActive = is_active;
    }

    const [total, entities] = await Promise.all([
      this.prisma.software.count({ where }),
      this.prisma.software.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: entities.map(SoftwareMapper.toDomain),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<Software | null> {
    const entity = await this.prisma.software.findUnique({
      where: { idSoftware: id },
    });
    if (!entity) return null;
    return SoftwareMapper.toDomain(entity);
  }

  async getSoftwareOptions(): Promise<SoftwareOptionDto[]> {
    const entities = await this.prisma.software.findMany({
      where: { isActive: true },
      select: {
        idSoftware: true,
        nombreSoftware: true,
      },
    });

    return entities.map((entity) => ({
      id: entity.idSoftware,
      nombre: entity.nombreSoftware,
    }));
  }
}