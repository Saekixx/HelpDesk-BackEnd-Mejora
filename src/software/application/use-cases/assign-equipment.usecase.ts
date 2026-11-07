import {
  SOFTWARE_EQUIPMENT_REPOSITORY,
  SoftwareEquipmentRepositoryPort,
} from '@/software/domain/ports/software-equipment.repository.port';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AssignSoftwareEquipmentDto } from '../dtos/assign-software-equipment.dto';

@Injectable()
export class AssignEquipmentUseCase {
  constructor(
    @Inject(SOFTWARE_EQUIPMENT_REPOSITORY)
    private readonly equipmentRepository: SoftwareEquipmentRepositoryPort,
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(idSoftware: number, dto: AssignSoftwareEquipmentDto): Promise<void> {
    // 1. Verificar que el software exista
    const software = await this.softwareRepository.findById(idSoftware);
    if (!software) {
      throw new NotFoundException('El software especificado no existe.');
    }

    // 2. Verificar que el equipo exista
    const equipo = await this.equipmentRepository.findEquipmentById(dto.id_equipo);
    if (!equipo) {
      throw new NotFoundException('El equipo especificado no existe.');
    }

    // 3. Validar pertenencia de empresa (id_cliente cruzado)
    if (software.id_cliente && equipo.id_cliente && software.id_cliente !== equipo.id_cliente) {
      throw new BadRequestException(
        'El equipo seleccionado no pertenece a la misma empresa/cliente propietaria de este software.',
      );
    }

    // 4. Verificar cupos disponibles (Pool lleno)
    const activeAssignments = await this.equipmentRepository.findActiveBySoftwareId(idSoftware);
    const currentUsed = activeAssignments.length;
    const limit = software.limite_equipos ?? 1;

    if (currentUsed >= limit) {
      throw new BadRequestException('No hay cupos disponibles (pool lleno) para este software.');
    }

    // 5. Registrar la asignación con los campos exactos requeridos
    await this.equipmentRepository.assignEquipment({
      id_software: idSoftware,
      id_equipo: dto.id_equipo,
      correo_asociado: dto.correo_asociado,
      licencia_especifica: dto.licencia_especifica,
      password_enc: dto.password_enc,
      fecha_instalacion: dto.fecha_instalacion ? new Date(dto.fecha_instalacion) : new Date(),
      is_active: true,
    });

    // 6. Actualizar las licencias usadas en el software
    await this.equipmentRepository.updateSoftwareUsedLicenses(idSoftware, currentUsed + 1);
  }
}