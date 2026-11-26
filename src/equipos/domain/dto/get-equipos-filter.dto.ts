// src/equipos/domain/dto/get-equipos-filter.dto.ts
import { AsignacionEquipo } from '../enums/asignacion-equipo.enum';
import { EstadoEquipo } from '../enums/estado-equipo.enum';

// Criterio de filtro de dominio para el listado paginado de equipos.
// Los valores por defecto (page=1, limit=10) se resuelven en la capa que
// consuma este filtro (use case / adaptador de persistencia).
export interface GetEquiposFilterDto {
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  search?: string; // Nombre del equipo, número de serie, marca/modelo o trabajador.
  estado?: EstadoEquipo; // Estado operativo del equipo (columna `estado`).
  asignacion?: AsignacionEquipo; // Con o sin trabajador asignado.
  page?: number;
  limit?: number;
}
