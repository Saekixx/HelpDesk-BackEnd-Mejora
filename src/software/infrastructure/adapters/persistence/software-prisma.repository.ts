import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { SoftwareRepositoryPort } from '@/software/domain/ports/software.repository.port';
import { Software } from '@/software/domain/entities/software.entity';
import { SoftwareMapper } from './mappers/software.mapper';
import { Prisma } from '@prisma/client';
import { SoftwareOptionDto } from '@/software/domain/dtos/get-software.dto';

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

  async findAll(): Promise<Software[]> {
    const entities = await this.prisma.software.findMany();
    return entities.map(SoftwareMapper.toDomain);
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