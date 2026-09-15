// src/equipos/domain/dto/create-equipo.dto.ts

// Contrato de dominio para la creación de un equipo.
export interface CreateEquipoDto {
  tipo: string;
  marca: string;
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