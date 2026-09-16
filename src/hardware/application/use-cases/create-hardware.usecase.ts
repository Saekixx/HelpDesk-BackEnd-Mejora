import{
    HARDWARE_REPOSITORY,
    HardwareRepositoryPort,
}from'@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { CreateHardwareDto } from '../dtos/create-hardware.dto';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';

@Injectable()
export class CreateHardwareUseCase{
    constructor(
        @Inject(HARDWARE_REPOSITORY)
        private readonly hardwareRepository: HardwareRepositoryPort,
    ){}

    async execute(hardwareData: CreateHardwareDto): Promise<void>{
        const newHardare = new Hardware({
            tipo_equipo: hardwareData.tipo_equipo,
            numero_serie: hardwareData.numero_serie,
            fecha_compra: new Date(hardwareData.fecha_compra),
            marca: hardwareData.marca,
            proveedor: hardwareData.proveedor,
            descripcion: hardwareData.descripcion,
            is_active: true,
        });
        await this.hardwareRepository.save(newHardare);
    }
}