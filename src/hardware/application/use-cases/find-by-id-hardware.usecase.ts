import { Hardware } from "@/hardware/domain/entities/hardware.entity";
import{
    HARDWARE_REPOSITORY,
    HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class FindByIdHardwareUseCase{
    constructor(
        @Inject(HARDWARE_REPOSITORY)
        private readonly hardwareRepository: HardwareRepositoryPort,
    ){}

    async execute(id: number): Promise<Hardware | null>{
        return this.hardwareRepository.findById(id);
    }
}