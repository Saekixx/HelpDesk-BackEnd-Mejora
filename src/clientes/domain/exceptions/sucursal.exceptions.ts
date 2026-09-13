// src/clientes/domain/exceptions/sucursal.exceptions.ts
import { DomainException } from '@/common/domain/domain.exception';

export class SucursalNotFoundException extends DomainException {
  constructor() {
    super('Sucursal no encontrada', 404);
  }
}