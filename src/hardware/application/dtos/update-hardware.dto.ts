import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

export interface UpdateHardwareDto {
  tipo_componente?: TipoComponente;
  numero_serie?: string;
  marca_modelo?: string;
  proveedor?: string;
  fecha_compra?: string;
  costo_unitario?: number;
  url_factura?: string;
}
