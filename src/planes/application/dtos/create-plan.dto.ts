export interface CreatePlanDto {
  numero_plan: number;
  tipo: string;
  servicio: string[];
  precio: number;
  limite_equipos: number;
}
