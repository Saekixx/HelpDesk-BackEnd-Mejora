import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { HardwareOptionDto } from '@/hardware/domain/dtos/get-hardware.dto';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { HardwareRepositoryPort } from '@/hardware/domain/ports/hardware.repository.port';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HardwareMapper } from './mappers/hardware.mapper';

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

  async findAll(): Promise<Hardware[]> {
    const entities = await this.prisma.hardware.findMany();
    return entities.map(HardwareMapper.toDomain);
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
      },
    });

    return entities.map((entity) => ({
      id: entity.id_hardware,
      nombre: `${entity.tipo_equipo} - ${entity.marca}`,
    }));
  }
}