// src/clientes/domain/exceptions/area.exceptions.ts
import { DomainException } from '@/common/domain/domain.exception';

export class AreaNotFoundException extends DomainException {
  constructor() {
    super('Área no encontrada', 404);
  }
}