export const SOFTWARE_EQUIPMENT_REPOSITORY = 'SOFTWARE_EQUIPMENT_REPOSITORY';

export interface SoftwareEquipmentRepositoryPort {
  findEquipmentById(
    idEquipo: number,
  ): Promise<{ id_equipo: number; id_cliente?: number | null } | null>;

  findActiveBySoftwareId(idSoftware: number): Promise<any[]>;

  assignEquipment(data: {
    id_software: number;
    id_equipo: number;
    correo_asociado?: string;
    licencia_especifica?: string;
    observaciones?: string;
    password_enc?: string;
    fecha_instalacion?: Date;
    is_active: boolean;
  }): Promise<void>;
  releaseAssignment(idSoftwareEquipos: number): Promise<void>;

  findAssignmentById(idSoftwareEquipos: number): Promise<any | null>;

  updateSoftwareUsedLicenses(
    idSoftware: number,
    usedCount: number,
  ): Promise<void>;
}
