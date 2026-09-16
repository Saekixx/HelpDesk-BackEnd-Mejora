import { Hardware } from "@/hardware/domain/entities/hardware.entity";
import{
    HARDWARE_REPOSITORY,
    HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class FindAllHardwareUseCase{
    constructor(
        @Inject(HARDWARE_REPOSITORY)
        private readonly hardwareRepository: HardwareRepositoryPort,
    ){}

    async execute(): Promise<Hardware[]>{
        return this.hardwareRepository.findAll();
    }
}