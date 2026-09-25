export class InvalidStateTransitionException extends Error {
  constructor(fromState: string, action: string) {
    super(
      `No se puede realizar la acción '${action}' en el estado '${fromState}'.`,
    );
    this.name = 'InvalidStateTransitionException';
  }
}
