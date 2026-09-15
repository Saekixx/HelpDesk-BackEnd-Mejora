// src/equipos/domain/dto/update-equipo.dto.ts
import { CreateEquipoDto } from './create-equipo.dto';

// Todos los campos de creación son opcionales.
export type UpdateEquipoDto = Partial<CreateEquipoDto>;