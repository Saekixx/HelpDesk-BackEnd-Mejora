import { CitaEstado } from '../entity/cita-soporte.entity';

export class CitaSoporteDetalleCriteria {
  id_cita: number;
  estado: CitaEstado; // Pendiente, En_Camino, Completada, Cancelada, Reprogramada
  fecha_programada: Date;
  hora_inicio: Date;
  hora_fin: Date;
  observaciones: string | null;
  tecnico: {
    id_tecnico: number;
    nombre: string;
    apellido: string;
  };
  cliente: {
    id_cliente: number;
    nombre_principal: string;
    numero_documento: string;
  };
  sucursal: {
    id_sucursal: number;
    nombre_sucursal: string;
    direccion: string;
    latidud: number | null;
    longitud: number | null;
  };
  area: {
    id_area: number;
    nombre_area: string;
  };
  trabajador: {
    id_trabajador: number;
    nombre: string;
    apellido: string;
  };
  equipo: {
    id_equipo: number;
    tipo: string;
    ultima_revision: Date | null;
  };
}
