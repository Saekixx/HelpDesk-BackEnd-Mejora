import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { PlanRepositoryPort } from '@/planes/domain/ports/plan.repository.port';
import { Plan } from '@/planes/domain/entities/plan.entity';
import { PlanMapper } from '../mappers/plan.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlanPrismaRepository implements PlanRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(plan: Plan): Promise<Plan> {
    const data = PlanMapper.toPersistence(plan);

    if (plan.id_plan) {
      const updated = await this.prisma.planes.update({
        where: { id_plan: plan.id_plan },
        data,
      });
      return PlanMapper.toDomain(updated);
    }

    const created = await this.prisma.planes.create({
      data: data as Prisma.planesCreateInput,
    });
    return PlanMapper.toDomain(created);
  }

  async findById(id: number): Promise<Plan | null> {
    const entity = await this.prisma.planes.findUnique({
      where: { id_plan: id },
    });
    if (!entity) return null;
    return PlanMapper.toDomain(entity);
  }
}
