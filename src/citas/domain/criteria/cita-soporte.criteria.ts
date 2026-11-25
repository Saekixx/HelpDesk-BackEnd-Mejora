import { CitaEstado } from '../entity/cita-soporte.entity';

export class CitaSoporteCriteria {
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
  };
}
