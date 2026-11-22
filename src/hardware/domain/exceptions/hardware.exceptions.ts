import { DomainException } from '@/common/domain/domain.exception';
import {
  ESTADO_HARDWARE_LABEL,
  EstadoHardware,
} from '../enums/estado-hardware.enum';

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

export class HardwareNotFoundException extends DomainException {
  constructor(id_hardware: number) {
    super(`El hardware con ID ${id_hardware} no existe`, 404);
  }
}

// El estado destino no es alcanzable desde el estado actual (409).
export class TransicionHardwareInvalidaException extends DomainException {
  constructor(desde: EstadoHardware, hacia: EstadoHardware) {
    super(
      desde === EstadoHardware.BAJA
        ? `El hardware está en estado '${ESTADO_HARDWARE_LABEL[desde]}' y no admite más cambios de estado`
        : `No se puede cambiar un hardware de '${ESTADO_HARDWARE_LABEL[desde]}' a '${ESTADO_HARDWARE_LABEL[hacia]}'`,
      409,
    );
  }
}

// La transición pedida no cambiaría nada: ya está en ese estado (y equipo) (409).
export class HardwareSinCambioDeEstadoException extends DomainException {
  constructor(estado: EstadoHardware, id_equipo: number | null) {
    super(
      id_equipo === null
        ? `El hardware ya se encuentra en estado '${ESTADO_HARDWARE_LABEL[estado]}'`
        : `El hardware ya se encuentra instalado en el equipo con ID ${id_equipo}`,
      409,
    );
  }
}

// Otra operación cambió (o eliminó) el hardware mientras se aplicaba la
// transición (409).
export class HardwareModificadoConcurrentementeException extends DomainException {
  constructor() {
    super(
      'El hardware fue modificado por otra operación. Actualice los datos e intente nuevamente',
      409,
    );
  }
}
