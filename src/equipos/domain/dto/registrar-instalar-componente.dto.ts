// src/equipos/domain/dto/registrar-instalar-componente.dto.ts
import { TipoComponente } from '@/hardware/domain/enums/tipo-componente.enum';

// Contrato de dominio para registrar un componente nuevo y dejarlo instalado
// en un equipo. El id del equipo se recibe por separado (parámetro de ruta) y
// el técnico responsable lo toma el controlador del usuario autenticado.
// Las fechas llegan en formato ISO 8601; el caso de uso las convierte a Date.
export interface RegistrarInstalarComponenteDto {
  tipo_componente: TipoComponente;
  marca_modelo: string;
  numero_serie: string;
  proveedor?: string;
  fecha_compra?: string;
  url_factura?: string;
  fecha_instalacion: string;
  observaciones?: string;
}
