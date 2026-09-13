// src/clientes/domain/dto/update-sucursal.dto.ts
import { CreateSucursalDto } from './create-sucursal.dto';

// Todos los campos de creación son opcionales.
export type UpdateSucursalDto = Partial<CreateSucursalDto>;