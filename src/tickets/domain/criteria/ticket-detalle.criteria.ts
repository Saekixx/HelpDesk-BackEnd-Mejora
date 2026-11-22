export class TicketDetalleCriteria {
  id_ticket: number;
  pin: string;
  asunto: string;
  detalle: string;
  es_software: boolean;
  createdAt: Date;
  updatedAt: Date;
  estado: string;
  trabajador: {
    id_trabajador: number;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    id_cliente: number;
    nombre_cliente: string;
    id_sucursal: number;
    nombre_sucursal: string;
    id_area: number;
    nombre_area: string;
  } | null;
  equipo: {
    id_equipo: number;
    nombre_equipo: string;
    tipo: string;
    numero_serie: string;
    marca_modelo: string;
  } | null;
  soporte: {
    id_soporte: number;
    nombre: string;
    apellido: string;
    telefono: string;
    correo: string;
    area: string;
    rol: string;
  } | null;
}
