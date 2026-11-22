// Resultado de dominio de las estadísticas (KPIs) del módulo de clientes.
// Alimenta las tarjetas superiores de la vista de gestión de clientes.
export interface ClienteStatsResult {
  // Total de clientes registrados y los creados desde el primer día del mes actual
  totalClientes: {
    cantidad: number;
    nuevosEsteMes: number;
  };
  clientesJuridicos: {
    cantidad: number;
  };
  clientesNaturales: {
    cantidad: number;
  };
  // Clientes activos cuyo plan asociado es Enterprise
  planesEnterprise: {
    cantidad: number;
  };
}
