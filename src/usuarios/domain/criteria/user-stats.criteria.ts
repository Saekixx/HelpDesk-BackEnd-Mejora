export interface UserStatsCriteria {
  totalUsuarios: {
    cantidad: number;
    activos: number;
    inactivos: number;
  };
  personalTecnico: {
    cantidad: number;
  };
  cuentasClientes: {
    cantidad: number;
  };
}
