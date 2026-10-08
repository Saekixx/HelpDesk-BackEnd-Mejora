import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { HardwareRepositoryPort } from '@/hardware/domain/ports/hardware.repository.port';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { HardwareMapper } from './mappers/hardware.mapper';
import { Prisma } from '@prisma/client';
import { HardwareOptionDto } from '@/hardware/domain/dtos/get-hardware.dto';
import { FilterHardwareDto } from '@/hardware/application/dtos/filter-hardware.dto';

@Injectable()
export class HardwarePrismaRepository implements HardwareRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(hardware: Hardware): Promise<Hardware> {
    const data = HardwareMapper.toPersistence(hardware);

    if (hardware.id_hardware) {
      const updated = await this.prisma.hardware.update({
        where: { id_hardware: hardware.id_hardware },
        data,
      });
      return HardwareMapper.toDomain(updated);
    }

    const created = await this.prisma.hardware.create({
      data: data as Prisma.hardwareCreateInput,
    });
    return HardwareMapper.toDomain(created);
  }

  async findAll(filterDto: FilterHardwareDto): Promise<{
    data: Hardware[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { search, tipo, is_active, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where: Prisma.hardwareWhereInput = {};

    if (search) {
      where.OR = [
        { tipo_equipo: { contains: search } },
        { marca: { contains: search } },
        { numero_serie: { contains: search } },
        { proveedor: { contains: search } },
      ];
    }

    if (tipo) {
      where.tipo_equipo = { contains: tipo };
    }

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const [total, entities] = await Promise.all([
      this.prisma.hardware.count({ where }),
      this.prisma.hardware.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      data: entities.map(HardwareMapper.toDomain),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<Hardware | null> {
    const entity = await this.prisma.hardware.findUnique({
      where: { id_hardware: id },
    });
    if (!entity) return null;
    return HardwareMapper.toDomain(entity);
  }

  async getHardwareOptions(): Promise<HardwareOptionDto[]> {
    const entities = await this.prisma.hardware.findMany({
      where: { is_active: true },
      select: {
        id_hardware: true,
        tipo_equipo: true,
        marca: true,
        numero_serie: true,
      },
    });

    return entities.map((entity) => ({
      id: entity.id_hardware,
      nombre: `${entity.tipo_equipo} ${entity.marca ?? ''} (${entity.numero_serie})`.trim(),
    }));
  }
}