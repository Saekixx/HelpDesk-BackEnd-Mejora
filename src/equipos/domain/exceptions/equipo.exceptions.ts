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
