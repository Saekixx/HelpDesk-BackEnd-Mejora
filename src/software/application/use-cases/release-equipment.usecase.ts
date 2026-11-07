import {
  SOFTWARE_EQUIPMENT_REPOSITORY,
  SoftwareEquipmentRepositoryPort,
} from '@/software/domain/ports/software-equipment.repository.port';
import {
  SOFTWARE_REPOSITORY,
  SoftwareRepositoryPort,
} from '@/software/domain/ports/software.repository.port';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ReleaseEquipmentUseCase {
  constructor(
    @Inject(SOFTWARE_EQUIPMENT_REPOSITORY)
    private readonly equipmentRepository: SoftwareEquipmentRepositoryPort,
    @Inject(SOFTWARE_REPOSITORY)
    private readonly softwareRepository: SoftwareRepositoryPort,
  ) {}

  async execute(idSoftwareEquipos: number): Promise<void> {
    // 1. Buscar la asignación
    const assignment = await this.equipmentRepository.findAssignmentById(idSoftwareEquipos);
    if (!assignment) {
      throw new NotFoundException('La asignación de software no fue encontrada.');
    }

    // 2. Liberar lógicamente (is_active = false)
    await this.equipmentRepository.releaseAssignment(idSoftwareEquipos);

    // 3. Recalcular y actualizar licencias usadas
    const activeAssignments = await this.equipmentRepository.findActiveBySoftwareId(assignment.id_software);
    await this.equipmentRepository.updateSoftwareUsedLicenses(assignment.id_software, activeAssignments.length);
  }
}