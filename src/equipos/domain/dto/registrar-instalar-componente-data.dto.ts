// src/equipos/domain/dto/registrar-instalar-componente-data.dto.ts
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

// Datos que el caso de uso entrega al repositorio para registrar un componente
// nuevo y dejarlo instalado en un equipo. El id del equipo se recibe por
// separado (parámetro de ruta). El estado (Instalado) y el equipo actual los
// fija el repositorio; no forman parte del contrato.
export interface RegistrarInstalarComponenteData {
  tipoComponente: TipoComponente;
  marcaModelo: string;
  numeroSerie: string;
  proveedor?: string;
  fechaCompra?: Date;
  urlFactura?: string;
  fechaInstalacion: Date;
  observaciones?: string;
  idTecnico?: number;
}
