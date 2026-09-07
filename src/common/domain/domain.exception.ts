// src/domain/exceptions/domain.exception.ts

// Clase base para todas las excepciones de dominio en la aplicación.
// Extiende la clase Error de JavaScript y agrega un código de estado HTTP opcional.
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
