import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';

/**
 * Criterios de filtrado y paginación del listado de hardware.
 * La validación HTTP vive en `FindAllHardwareQueryDto` (infrastructure).
 */
export interface FilterHardwareDto {
  search?: string;
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  tipo_componente?: string;
  estado?: EstadoHardware;
  proveedor?: string;
  page?: number;
  limit?: number;
}
