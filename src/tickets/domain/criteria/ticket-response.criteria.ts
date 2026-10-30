export class TicketResponseCriteria {
  id_ticket: number;
  pin: string;
  asunto: string;
  detalle: string;
  estado: string;

  equipo: {
    id_equipo: number;
    nombre: string;
    marca_modelo: string;
    tipo: string;
    numero_serie: string;
  } | null;

  cliente: {
    id_cliente: number;
    nombre: string;
  } | null;

  sucursal: {
    id_sucursal: number;
    nombre: string;
  } | null;

  area: {
    id_area: number;
    nombre: string;
  } | null;

  soporte: {
    id_soporte: number;
    nombre: string;
    apellido: string;
  } | null;
}
