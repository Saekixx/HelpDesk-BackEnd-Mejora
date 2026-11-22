import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

/** Item del listado simplificado de hardware (GET /hardware/options). */
export interface HardwareOptionResponseDto {
  id_hardware: number;
  numero_serie: string;
  marca_modelo: string;
  // Clave del enum (ej. "MEMORIA_RAM")
  tipo_componente: TipoComponente;
  // Clave del enum (ej. "DISPONIBLE")
  estado: EstadoHardware;
}
