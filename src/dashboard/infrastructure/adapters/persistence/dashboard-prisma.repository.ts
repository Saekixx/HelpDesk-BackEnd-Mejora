// src/dashboard/infrastructure/adapters/persistence/dashboard-prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import { DashboardRepositoryPort } from '../../../domain/ports/dashboard.repository.port';
import { DashboardFilterCriteria } from '../../../domain/criteria/dashboard-filter.criteria';
import { AdminDashboardMetrics } from '../../../domain/entities/admin-dashboard-metrics.entity';
import { DashboardMapper } from './mappers/dashboard.mapper';

@Injectable()
export class DashboardPrismaRepository implements DashboardRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminMetrics(
    filters: DashboardFilterCriteria,
  ): Promise<AdminDashboardMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Tarjetas KPI Principales
    const ticketsEnProgreso = await this.prisma.tickets.count({
      where: { estado: 'En_Progreso' },
    });

    const citasProgramadasHoy = await this.prisma.citas_soporte.count({
      where: {
        fecha_programada: {
          gte: today,
          lt: tomorrow,
        },
        estado: 'Pendiente',
      },
    });

    // Total Clientes y desglose por tipo (JURIDICA / NATURAL)
    const totalClientesCount = await this.prisma.clientes.count();
    const juridicasCount = await this.prisma.clientes.count({
      where: { tipo_cliente: 'JURIDICA' },
    });
    const naturalesCount = await this.prisma.clientes.count({
      where: { tipo_cliente: 'NATURAL' },
    });

    // Equipos Operativos vs Total Equipos
    const totalEquipos = await this.prisma.equipos.count();
    const equiposOperativos = await this.prisma.equipos.count({
      where: { is_active: true },
    });

    // 2. Incidencias por Cliente (Top 5 con más tickets)
    const ticketsPorClienteRaw = await this.prisma.tickets.groupBy({
      by: ['id_equipo'],
      _count: { id_tickets: true },
    });

    const equiposConCliente = await this.prisma.equipos.findMany({
      select: {
        id_equipo: true,
        clientes: {
          select: { id_cliente: true, nombre_empresa: true },
        },
      },
    });

    const clienteMap = new Map<number, { nombre: string; count: number }>();

    for (const t of ticketsPorClienteRaw) {
      const equipo = equiposConCliente.find((e) => e.id_equipo === t.id_equipo);
      if (equipo && equipo.clientes) {
        const clienteId = equipo.clientes.id_cliente;
        const nombreEmpresa =
          equipo.clientes.nombre_empresa ?? 'Empresa Cliente';
        const current = clienteMap.get(clienteId) ?? {
          nombre: nombreEmpresa,
          count: 0,
        };
        clienteMap.set(clienteId, {
          nombre: nombreEmpresa,
          count: current.count + t._count.id_tickets,
        });
      }
    }

    const incidenciasPorCliente = Array.from(clienteMap.entries())
      .map(([id_cliente, data]) => ({
        id_cliente,
        nombre_cliente: data.nombre,
        _count: { tickets: data.count },
      }))
      .sort((a, b) => b._count.tickets - a._count.tickets)
      .slice(0, 5);

    // 3. Citas Programadas para Hoy (Lista lateral)
    const citasHoy = await this.prisma.citas_soporte.findMany({
      where: {
        fecha_programada: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        usuarios: true,
        sucursales: {
          include: {
            clientes: true,
          },
        },
      },
      orderBy: { hora_inicio: 'asc' },
    });

    // 4. Volumen de Requerimientos (Tickets Registrados vs Resueltos) y Historial Real de 7 días
    const totalRegistrados = await this.prisma.tickets.count();
    const totalResueltos = await this.prisma.tickets.count({
      where: { estado: 'Cerrado' },
    });

    // Cálculo dinámico de los últimos 7 días reales para el gráfico de líneas
    const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const historialSemanal = [];

    for (let i = 6; i >= 0; i--) {
      const startDay = new Date();
      startDay.setDate(today.getDate() - i);
      startDay.setHours(0, 0, 0, 0);

      const endDay = new Date(startDay);
      endDay.setDate(startDay.getDate() + 1);

      // Conteo real de tickets creados en este día
      const creadosDia = await this.prisma.tickets.count({
        where: {
          created_at: {
            gte: startDay,
            lt: endDay,
          },
        },
      });

      // Conteo real de tickets resueltos/cerrados en este día
      const resueltosDia = await this.prisma.tickets.count({
        where: {
          estado: 'Cerrado',
          updated_at: {
            // O la fecha en que se marcó como cerrado, según tu esquema
            gte: startDay,
            lt: endDay,
          },
        },
      });

      const nombreDia = diasNombres[startDay.getDay()];
      historialSemanal.push({
        dia: nombreDia,
        creados: creadosDia,
        resueltos: resueltosDia,
      });
    }

    // 5. Alertas de Software y Licencias próximas a vencer (< 30 días)
    const fechaLimiteAlerta = new Date();
    fechaLimiteAlerta.setDate(fechaLimiteAlerta.getDate() + 30);

    const alertasLicencias = await this.prisma.software.findMany({
      where: {
        fecha_caducidad: {
          lte: fechaLimiteAlerta,
          gte: today,
        },
      },
      include: {
        _count: {
          select: { software_equipos: true },
        },
      },
      take: 4,
      orderBy: { fecha_caducidad: 'asc' },
    });

    // 6. Ensamblaje y retorno a través del Mapper
    return DashboardMapper.toDomain({
      ticketsEnProgreso,
      citasProgramadasHoy,
      totalClientes: {
        total: totalClientesCount,
        juridicas: juridicasCount,
        naturales: naturalesCount,
      },
      equiposOperativos: {
        operativos: equiposOperativos,
        total: totalEquipos,
      },
      incidenciasPorCliente,
      citasHoy,
      volumen: {
        registrados: totalRegistrados,
        resueltos: totalResueltos,
        historial: historialSemanal,
      },
      alertasLicencias,
    });
  }
}
