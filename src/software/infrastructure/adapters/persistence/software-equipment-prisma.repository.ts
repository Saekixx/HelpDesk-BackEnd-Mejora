import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { SoftwareEquipmentRepositoryPort } from '@/software/domain/ports/software-equipment.repository.port';

@Injectable()
export class SoftwareEquipmentPrismaRepository implements SoftwareEquipmentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findEquipmentById(idEquipo: number) {
    return await this.prisma.equipos.findUnique({
      where: { id_equipo: idEquipo },
      select: { id_equipo: true, id_cliente: true },
    });
  }

  async findActiveBySoftwareId(idSoftware: number) {
    return await this.prisma.software_equipos.findMany({
      where: { id_software: idSoftware, is_active: true },
    });
  }

  async assignEquipment(data: {
    id_software: number;
    id_equipo: number;
    correo_asociado?: string;
    observaciones?: string;
    licencia_especifica?: string;
    password_enc?: string;
    fecha_instalacion?: Date;
    is_active: boolean;
  }): Promise<void> {
    await this.prisma.software_equipos.create({
      data: {
        id_software: data.id_software,
        id_equipo: data.id_equipo,
        correo_asociado: data.correo_asociado,
        observaciones: data.observaciones,
        licencia_especifica: data.licencia_especifica,
        password_enc: data.password_enc,
        fecha_instalacion: data.fecha_instalacion ?? new Date(),
        is_active: data.is_active,
      },
    });
  }

  async findAssignmentById(idSoftwareEquipos: number) {
    return await this.prisma.software_equipos.findUnique({
      where: { id_software_equipos: idSoftwareEquipos },
    });
  }

  async releaseAssignment(idSoftwareEquipos: number): Promise<void> {
    await this.prisma.software_equipos.update({
      where: { id_software_equipos: idSoftwareEquipos },
      data: { is_active: false },
    });
  }

  async updateSoftwareUsedLicenses(
    idSoftware: number,
    usedCount: number,
  ): Promise<void> {
    await this.prisma.software.update({
      where: { id_software: idSoftware },
      data: { licencias_usadas: usedCount },
    });
  }
}
