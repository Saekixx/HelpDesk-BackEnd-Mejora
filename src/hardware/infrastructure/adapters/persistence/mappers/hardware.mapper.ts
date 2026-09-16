import { hardware as PrismaHardware, Prisma } from "@prisma/client";
import { Hardware } from "@/hardware/domain/entities/hardware.entity";

export class HardwareMapper{
    static toDomain(entity: PrismaHardware): Hardware{
        return new Hardware({
            id_hardware : entity.id_hardware,
            tipo_equipo : entity.tipo_equipo,
            numero_serie : entity.numero_serie,
            fecha_compra : entity.fecha_compra,
            marca : entity.marca,
            proveedor : entity.proveedor,
            descripcion : entity.descripcion ?? undefined,
            ult_revision: entity.ult_revision ?? undefined,
            rev_programada:entity.rev_programada ?? undefined,
            is_active : entity.is_active ?? true,
        });
    }

    static toPersistence(domain: Hardware): Partial<PrismaHardware>{
        return {
            ...(domain.id_hardware && { id_hardware: domain.id_hardware}),
            tipo_equipo: domain.tipo_equipo,
            numero_serie: domain.numero_serie,
            fecha_compra: domain.fecha_compra,
            marca: domain.marca,
            proveedor: domain.proveedor,
            descripcion: domain.descripcion ?? null,
            ult_revision: domain.ult_revision ?? null,
            rev_programada: domain.rev_programada ?? null,
            is_active: domain.is_active,
        }
    }
}