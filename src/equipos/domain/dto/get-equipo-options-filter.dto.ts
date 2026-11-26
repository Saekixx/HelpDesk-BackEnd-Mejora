// src/equipos/domain/dto/get-equipo-options-filter.dto.ts
import { EstadoEquipo } from '../enums/estado-equipo.enum';

// Criterio de filtro de dominio para las opciones de equipos (selectores en
// cascada). Todos los campos son opcionales; los omitidos no restringen.
export interface GetEquipoOptionsFilterDto {
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  estado?: EstadoEquipo; // Estado operativo del equipo (columna `estado`).
  search?: string; // Nombre del equipo, número de serie o marca/modelo.
}
