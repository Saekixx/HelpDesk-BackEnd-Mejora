import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/common/infrastructure/prisma/prisma.service";
import { HardwareRepositoryPort } from "@/hardware/domain/ports/hardware.repository.port";
import { Hardware } from "@/hardware/domain/entities/hardware.entity";
import { HardwareMapper } from "./mappers/hardware.mapper";
import { Prisma } from "@prisma/client";

@Injectable()
export class HardwarePrismaRepository implements HardwareRepositoryPort{
    constructor (private readonly prisma: PrismaService){}

    async save(hardware: Hardware): Promise<Hardware> {
        const data = HardwareMapper.toPersistence(hardware);

        if (hardware.id_hardware){
            const { id_hardware, ...updateData } = data;
            const update = await this.prisma.hardware.update({
                where: { id_hardware:hardware.id_hardware},
                data,
            });
            return HardwareMapper.toDomain(update);
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
        where:{id_hardware: id},
    });
    if (!entity) return null;
    return HardwareMapper.toDomain(entity);
    }
}