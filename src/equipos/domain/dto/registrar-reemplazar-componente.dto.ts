// src/equipos/domain/dto/registrar-reemplazar-componente.dto.ts
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

// Contrato de dominio para reemplazar un componente instalado por uno nuevo
// que se registra en el mismo acto. Los ids del equipo y del componente
// saliente se reciben por separado (parámetros de ruta) y el técnico
// responsable lo toma el controlador del usuario autenticado. Las fechas
// llegan en formato ISO 8601; el caso de uso las convierte a Date.
export interface RegistrarReemplazarComponenteDto {
  tipo_componente: TipoComponente;
  marca_modelo: string;
  numero_serie: string;
  proveedor?: string;
  fecha_compra?: string;
  url_factura?: string;
  fecha_reemplazo: string;
  // Motivo del reemplazo.
  observaciones?: string;
}
