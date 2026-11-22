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

export class InvalidBulkFileException extends DomainException {
  constructor(reason: string) {
    super(`Archivo de carga masiva inválido: ${reason}`, 400);
  }
}

export class UsersBatchConflictException extends DomainException {
  constructor() {
    super(
      'No se registró ningún usuario: alguno de los correos fue registrado por otro proceso. Vuelve a validar la carga e inténtalo de nuevo.',
      409,
    );
  }
}
