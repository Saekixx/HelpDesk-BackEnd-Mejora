import {Hardware} from '../entities/hardware.entity'

export const HARDWARE_REPOSITORY = 'HARDWARE_REPOSITORY';

export interface HardwareRepositoryPort{
    save(hardware:Hardware): Promise<Hardware>;

    findAll() : Promise<Hardware[]>;

    findById(id : number) : Promise<Hardware | null>;
}