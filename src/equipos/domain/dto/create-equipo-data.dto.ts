// src/equipos/domain/dto/create-equipo-data.dto.ts
import { CreateEquipoDto } from './create-equipo.dto';
import { EstadoEquipo } from '../enums/estado-equipo.enum';

// Datos que el caso de uso entrega al repositorio para crear un equipo: lo
// que envía el cliente más los valores que el sistema calcula (estado según
// tenga trabajador asignado, y alta activa).
export interface CreateEquipoData extends CreateEquipoDto {
  estado: EstadoEquipo;
  is_active: boolean;
}
