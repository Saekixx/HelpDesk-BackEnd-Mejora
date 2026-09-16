export interface TicketFilterCriteria {
  search?: string;
  estado?: string;
  id_cliente?: number;
  id_sucursal?: number;
  id_area?: number;
  page?: number;
  limit?: number;
}
