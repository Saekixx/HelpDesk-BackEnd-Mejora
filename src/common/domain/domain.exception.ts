// src/domain/exceptions/domain.exception.ts
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
