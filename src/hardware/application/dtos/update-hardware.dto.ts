import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

/**
 * Datos de la ficha técnica que pueden editarse (PATCH /hardware/:id).
 * Actualización parcial: solo se modifican los campos enviados; omitido
 * (o null) = sin cambios. El estado y el equipo asignado no se editan aquí,
 * cambian con las operaciones de instalación, retiro y baja.
 * La validación HTTP vive en `UpdateHardwareRequestDto` (infrastructure).
 */
export interface UpdateHardwareDto {
  tipo_componente?: TipoComponente;
  numero_serie?: string;
  marca_modelo?: string;
  proveedor?: string;
  fecha_compra?: string;
  costo_unitario?: number;
  url_factura?: string;
}
