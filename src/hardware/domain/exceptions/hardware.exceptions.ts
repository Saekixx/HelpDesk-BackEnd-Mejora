import { DomainException } from '@/common/domain/domain.exception';

export class EquipoDestinoRequeridoException extends DomainException {
  constructor() {
    super('Debe indicar el equipo destino para instalar el hardware', 400);
  }
}

export class EquipoDestinoNotFoundException extends DomainException {
  constructor(id_equipo: number) {
    super(`El equipo destino con ID ${id_equipo} no existe`, 404);
  }
}
