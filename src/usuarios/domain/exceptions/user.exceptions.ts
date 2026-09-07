// domain/exceptions/user.exceptions.ts
import { DomainException } from '@/common/domain/domain.exception';

export class UserNotFoundException extends DomainException {
  constructor() {
    super('Usuario no encontrado', 404);
  }
}

export class EmailAlreadyInUseException extends DomainException {
  constructor() {
    super('El correo electrónico ya está en uso', 409);
  }
}
