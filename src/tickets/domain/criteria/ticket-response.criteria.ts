export class TicketResponseCriteria {
  id_tickets: number;
  pin: string;
  asunto: string;
  usuario: {
    id: number;
    nombre: string;
  };
  fecha_creacion: Date;
  equipo: {
    id: number;
    tipo_equipo: string;
  };
  cliente: {
    id: number;
    nombre: string;
  };
  sucursal?: {
    id: number;
    nombre: string;
  } | null;
  area?: {
    id: number;
    nombre: string;
  } | null;
  soporte: {
    id: number;
    nombre: string;
  } | null;
  estado: string;
}
