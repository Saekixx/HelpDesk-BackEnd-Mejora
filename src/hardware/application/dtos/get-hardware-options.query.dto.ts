import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

/**
 * Criterios de filtrado del listado simplificado de hardware para selectores
 * y autocompletados (GET /hardware/options).
 * La validación HTTP vive en `FindHardwareOptionsQueryDto` (infrastructure).
 */
export interface GetHardwareOptionsQueryDto {
  estado?: EstadoHardware;
  tipo_componente?: TipoComponente;
  id_equipo_actual?: number;
}
