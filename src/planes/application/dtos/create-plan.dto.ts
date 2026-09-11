export interface CreatePlanDto {
  numero_plan: number;
  tipo: string;
  servicios: string[];
  precio: number;
  limite_equipos: number;
}
