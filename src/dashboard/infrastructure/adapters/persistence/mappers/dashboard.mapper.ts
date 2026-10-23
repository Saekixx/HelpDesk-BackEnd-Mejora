// src/dashboard/infrastructure/adapters/persistence/mappers/dashboard.mapper.ts
import { 
  AdminDashboardMetrics, 
  IncidenciaCliente, 
  CitaHoySummary, 
  AlertaLicencia 
} from '../../../../domain/entities/admin-dashboard-metrics.entity';

export class DashboardMapper {
  
// Mapea los resultados crudos de las consultas de Prisma hacia la Entidad de Dominio global del Dashboard
  public static toDomain(raw: {
    ticketsEnProgreso: number;
    citasProgramadasHoy: number;
    totalClientes: { total: number; juridicas: number; naturales: number };
    equiposOperativos: { operativos: number; total: number };
    incidenciasPorCliente: any[];
    citasHoy: any[];
    volumen: { registrados: number; resueltos: number; historial: any[] };
    alertasLicencias: any[];
  }): AdminDashboardMetrics {

    // 1. Mapeo de incidencias por cliente y cálculo de porcentajes
    const totalTicketsGlobal = raw.volumen.registrados > 0 ? raw.volumen.registrados : 1;
    
    const incidenciasPorCliente: IncidenciaCliente[] = raw.incidenciasPorCliente.map((item) => {
      const count = item._count?.tickets ?? item.count ?? 0;
      const porcentaje = Number(((count / totalTicketsGlobal) * 100).toFixed(1));
      
      return {
        id_cliente: item.id_cliente,
        nombre_cliente: item.nombre_cliente ?? 'Cliente General',
        total_tickets: count,
        porcentaje,
      };
    });

    // 2. Mapeo de citas programadas para hoy (lista lateral)
    const citasHoy: CitaHoySummary[] = raw.citasHoy.map((cita) => {
      // Soportando la estructura actual de Prisma para citas y técnico
      const tecnicoNombre = cita.usuarios 
        ? `${cita.usuarios.nombre} ${cita.usuarios.apellido}` 
        : 'Sin asignar';

      const clienteNombre = cita.sucursales?.clientes?.nombre_empresa ?? 'Sucursal Principal';
      const sucursalNombre = cita.sucursales?.nombre_sucursal ?? 'Sede Central';

      return {
        id_cita: cita.id_cita,
        hora_inicio: cita.hora_inicio ? cita.hora_inicio.toString().substring(0, 5) : '08:00',
        hora_fin: cita.hora_fin ? cita.hora_fin.toString().substring(0, 5) : '09:00',
        cliente: clienteNombre,
        sucursal: sucursalNombre,
        asunto: cita.tickets?.asunto ?? cita.observaciones ?? 'Mantenimiento preventivo / Soporte',
        tecnico: tecnicoNombre,
        estado: cita.estado ?? 'Pendiente',
      };
    });

    // 3. Mapeo de alertas de licencias y software próximo a vencer
    const alertasLicencias: AlertaLicencia[] = raw.alertasLicencias.map((soft) => {
      const fechaCaducidad = new Date(soft.fechaCaducidad);
      const hoy = new Date();
      const diffTime = fechaCaducidad.getTime() - hoy.getTime();
      const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id_software: soft.idSoftware,
        nombre_software: soft.nombreSoftware,
        dias_para_vencer: diasParaVencer >= 0 ? diasParaVencer : 0,
        puestos_asignados: soft._count?.softwareEquipos ?? 0,
        estado_alerta: diasParaVencer <= 15 ? 'Renovación crítica' : 'Vencimiento próximo',
      };
    });

    // 4. Construcción final de la Entidad de Dominio
    return new AdminDashboardMetrics({
      kpis: {
        ticketsEnProgreso: raw.ticketsEnProgreso,
        citasProgramadasHoy: raw.citasProgramadasHoy,
        totalClientes: raw.totalClientes,
        equiposOperativos: raw.equiposOperativos,
      },
      incidenciasPorCliente,
      citasHoy,
      volumenRequerimientos: {
        resumen: {
          registrados: raw.volumen.registrados,
          resueltos: raw.volumen.resueltos,
          tasaCierrePrimerContacto: raw.volumen.registrados > 0 
            ? Number(((raw.volumen.resueltos / raw.volumen.registrados) * 100).toFixed(1)) 
            : 0,
        },
        historialSemanal: raw.volumen.historial,
      },
      alertasLicencias,
    });
  }
}