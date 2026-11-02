import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';
import { UbicacionInicial } from '@/hardware/domain/enums/ubicacion-inicial.enum';

/**
 * Datos para registrar un nuevo hardware (modal "Registrar Nuevo Hardware").
 * La validación HTTP vive en `CreateHardwareRequestDto` (infrastructure).
 */
export interface CreateHardwareDto {
  tipo_componente: TipoComponente;
  numero_serie: string;
  marca_modelo: string;
  proveedor?: string;
  fecha_compra?: string;
  costo_unitario?: number;
  url_factura?: string;
  ubicacion_inicial: UbicacionInicial;
  // Obligatorio solo cuando ubicacion_inicial = INSTALAR_EQUIPO.
  id_equipo_destino?: number;
}
