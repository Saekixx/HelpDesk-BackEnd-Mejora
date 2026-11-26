// src/equipos/domain/exceptions/equipo.exceptions.ts
import { DomainException } from '@/common/domain/domain.exception';

export class EquipoNotFoundException extends DomainException {
  constructor() {
    super('Equipo no encontrado', 404);
  }
}

export class EquipoAlreadyExistsException extends DomainException {
  constructor() {
    super('El número de serie ya está registrado en otro equipo', 409);
  }
}

export class ComponenteHardwareNotFoundException extends DomainException {
  constructor() {
    super('Componente de hardware no encontrado', 404);
  }
}

export class ComponenteNoInstaladoException extends DomainException {
  constructor() {
    super(
      'El componente saliente no está instalado actualmente en este equipo',
      404,
    );
  }
}

export class ClienteEquipoNoDisponibleException extends DomainException {
  constructor() {
    super('El cliente seleccionado no existe o está inactivo', 404);
  }
}

export class SucursalEquipoNoDisponibleException extends DomainException {
  constructor() {
    super('La sucursal seleccionada no existe o está inactiva', 404);
  }
}

export class AreaEquipoNoDisponibleException extends DomainException {
  constructor() {
    super('El área seleccionada no existe o está inactiva', 404);
  }
}

export class TrabajadorEquipoNoDisponibleException extends DomainException {
  constructor() {
    super('El trabajador asignado no existe o está inactivo', 404);
  }
}

export class SucursalNoPerteneceAClienteException extends DomainException {
  constructor() {
    super('La sucursal seleccionada no pertenece al cliente indicado', 400);
  }
}

export class AreaNoPerteneceASucursalException extends DomainException {
  constructor() {
    super('El área seleccionada no pertenece a la sucursal indicada', 400);
  }
}

export class TrabajadorNoPerteneceAClienteException extends DomainException {
  constructor() {
    super('El trabajador seleccionado no pertenece al cliente indicado', 400);
  }
}

export class EquipoInactivoException extends DomainException {
  constructor() {
    super('El equipo está desactivado y no se puede asignar', 409);
  }
}

// El componente existe pero no se puede montar: no está en estado Disponible
// o ya figura instalado en un equipo (409).
export class ComponenteNoDisponibleException extends DomainException {
  constructor() {
    super(
      'El componente no está disponible para instalar: debe estar en estado Disponible y sin equipo asignado',
      409,
    );
  }
}

// Ya existe un componente de hardware con ese número de serie (409).
export class NumeroSerieComponenteDuplicadoException extends DomainException {
  constructor() {
    super(
      'El número de serie ya está registrado en otro componente de hardware',
      409,
    );
  }
}

export class TecnicoResponsableNoDisponibleException extends DomainException {
  constructor() {
    super('El técnico responsable seleccionado no existe', 404);
  }
}

// El equipo existe pero está desactivado o retirado: no admite que se le
// instalen componentes (409).
export class EquipoInactivoParaComponentesException extends DomainException {
  constructor() {
    super(
      'El equipo está desactivado o retirado y no admite instalar componentes',
      409,
    );
  }
}
