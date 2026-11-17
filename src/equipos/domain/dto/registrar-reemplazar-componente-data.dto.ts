// src/equipos/domain/dto/registrar-reemplazar-componente-data.dto.ts
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

// Datos que el caso de uso entrega al repositorio para registrar un componente
// nuevo que reemplaza a otro ya instalado en un equipo. Los ids del equipo y
// del componente saliente se reciben por separado (parámetros de ruta). El
// estado (Instalado) y el equipo actual los fija el repositorio; no forman
// parte del contrato. `observaciones` es el motivo del reemplazo: se guarda
// como motivo de retiro del componente saliente y de instalación del nuevo.
export interface RegistrarEReemplazarComponenteData {
  tipoComponente: TipoComponente;
  marcaModelo: string;
  numeroSerie: string;
  proveedor?: string;
  fechaCompra?: Date;
  urlFactura?: string;
  fechaReemplazo: Date;
  observaciones?: string;
  idTecnico?: number;
}
