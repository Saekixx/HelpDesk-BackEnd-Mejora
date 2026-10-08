export class TicketParticipant {
  constructor(
    public readonly id: number,
    public readonly id_trabajador: number,
    public readonly id_soporte: number | null,
    public readonly estado: string,
  ) {}

  // Regla de negocio: Comprobar si un usuario tiene acceso al chat del ticket
  public canAccess(userId: number): boolean {
    return this.id_trabajador === userId || this.id_soporte === userId;
  }
}
