// src/clientes/domain/exceptions/cliente.exceptions.ts
import { DomainException } from '@/common/domain/domain.exception';

export class ClienteNotFoundException extends DomainException {
  constructor() {
    super('Cliente no encontrado', 404);
  }
}

export class DocumentoAlreadyInUseException extends DomainException {
  constructor() {
    super('El número de documento ya está registrado', 409);
  }
}