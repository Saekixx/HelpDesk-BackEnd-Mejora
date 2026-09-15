// src/equipos/domain/exceptions/equipo.exceptions.ts
import { DomainException } from '@/common/domain/domain.exception';

export class EquipoNotFoundException extends DomainException {
  constructor() {
    super('Equipo no encontrado', 404);
  }
}

export class EquipoAlreadyExistsException extends DomainException {
  constructor() {
    super('Ya existe un equipo registrado con ese número de serie', 409);
  }
}