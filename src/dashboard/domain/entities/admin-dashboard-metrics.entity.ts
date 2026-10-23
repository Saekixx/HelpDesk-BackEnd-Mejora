// src/dashboard/domain/entities/admin-dashboard-metrics.entity.ts// src/dashboard/domain/entities/admin-dashboard-metrics.entity.ts

export interface KpiCards {
  ticketsEnProgreso: number;
  citasProgramadasHoy: number;
  totalClientes: {
    total: number;
    juridicas: number;
    naturales: number;
  };
  equiposOperativos: {
    operativos: number;
    total: number;
  };
}

export interface IncidenciaCliente {
  id_cliente: number;
  nombre_cliente: string;
  total_tickets: number;
  porcentaje: number;
}

export interface CitaHoySummary {
  id_cita: number;
  hora_inicio: string;
  hora_fin: string;
  cliente: string;
  sucursal: string;
  asunto: string;
  tecnico: string;
  estado: string;
}

export interface VolumenRequerimientos {
  resumen: {
    registrados: number;
    resueltos: number;
    tasaCierrePrimerContacto: number;
  };
  historialSemanal: {
    dia: string;
    creados: number;
    resueltos: number;
  }[];
}

export interface AlertaLicencia {
  id_software: number;
  nombre_software: string;
  dias_para_vencer: number;
  puestos_asignados: number;
  estado_alerta: string;
}

export interface AdminDashboardMetricsProps {
  kpis: KpiCards;
  incidenciasPorCliente: IncidenciaCliente[];
  citasHoy: CitaHoySummary[];
  volumenRequerimientos: VolumenRequerimientos;
  alertasLicencias: AlertaLicencia[];
}

export class AdminDashboardMetrics {
  public readonly kpis: KpiCards;
  public readonly incidenciasPorCliente: IncidenciaCliente[];
  public readonly citasHoy: CitaHoySummary[];
  public readonly volumenRequerimientos: VolumenRequerimientos;
  public readonly alertasLicencias: AlertaLicencia[];

  constructor(props: AdminDashboardMetricsProps) {
    this.kpis = props.kpis;
    this.incidenciasPorCliente = props.incidenciasPorCliente ?? [];
    this.citasHoy = props.citasHoy ?? [];
    this.volumenRequerimientos = props.volumenRequerimientos;
    this.alertasLicencias = props.alertasLicencias ?? [];
  }
}