export class CreateCitaDto {
  id_ticket: number;
  id_sucursal: number;
  id_usuario: number;
  lock_token: string;
  observaciones?: string;
}
