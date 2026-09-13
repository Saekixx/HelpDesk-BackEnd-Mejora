// src/clientes/domain/dto/update-area.dto.ts
import { CreateAreaDto } from './create-area.dto';

// Todos los campos de creación son opcionales.
export type UpdateAreaDto = Partial<CreateAreaDto>;