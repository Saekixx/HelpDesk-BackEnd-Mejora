import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { AreaRepositoryPort } from '@/clientes/domain/ports/area.repository.port';
import { Area } from '@/clientes/domain/entities/area.entity';
import { AreaMapper } from './mappers/area.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class AreaPrismaRepository implements AreaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(area: Area): Promise<Area> {
    const data = AreaMapper.toPersistence(area);

    if (area.id_area) {
      const updated = await this.prisma.area.update({
        where: { id_area: area.id_area },
        data,
      });
      return AreaMapper.toDomain(updated);
    }

    const created = await this.prisma.area.create({
      data: data as Prisma.areaCreateInput,
    });
    return AreaMapper.toDomain(created);
  }

  async findById(id: number): Promise<Area | null> {
    const entity = await this.prisma.area.findUnique({
      where: { id_area: id },
    });
    if (!entity) return null;
    return AreaMapper.toDomain(entity);
  }
}
