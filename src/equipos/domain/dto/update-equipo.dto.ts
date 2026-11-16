// src/equipos/domain/dto/update-equipo.dto.ts

// Contrato de dominio para la edición de un equipo: todos los campos son opcionales.
export interface UpdateEquipoDto {
  tipo?: string;
  marca?: string;
  nombre_equipo?: string;
  num_serie?: string;
  nombre_usuario?: string;
  ult_revision?: Date;
  rev_programada?: Date;
  id_trabajador?: number;
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  is_active?: boolean;
}
