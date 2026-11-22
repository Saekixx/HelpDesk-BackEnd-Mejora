import {
  CITA_SOPORTE_REPOSITORY,
  CitaSoporteRepositoryPort,
} from '@/citas/domain/port/cita-soporte.repository.port';
import {
  SOFT_LOCK_REPOSITORY,
  SoftLockRepositoryPort,
} from '@/citas/domain/port/soft-lock.repository.port';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class GetAvailableSlotsUseCase {
  constructor(
    @Inject(CITA_SOPORTE_REPOSITORY)
    private readonly citaRepository: CitaSoporteRepositoryPort,
    @Inject(SOFT_LOCK_REPOSITORY)
    private readonly softLockRepository: SoftLockRepositoryPort,
  ) {}

  async execute(
    id_tecnico: number,
    fecha: string,
    id_sucursal_actual: number,
  ): Promise<{ franja: string; disponible: boolean }[]> {
    // Franjas horarias estándar con un período de 3 horas (puede ajustarse según la necesidad)
    const franjasEstandar = ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00'];

    const fechaDate = new Date(`${fecha}T00:00:00`);

    // Obtener citas confirmadas para ese técnico en esa fecha
    const citasOcupadas = await this.citaRepository.findByTecnicoAndFecha(
      id_tecnico,
      fechaDate,
    );

    // Obtener soft locks activos y vigentes para ese técnico en esa fecha
    const locksActivos = await this.softLockRepository.findByTecnicoAndFecha(
      id_tecnico,
      fechaDate,
    );

    // Evaluar la disponibilidad de cada franja aplicando la regla de sucursales
    return franjasEstandar.map((franja) => {
      // Filtrar citas confirmadas que correspondan a esta franja
      const citasEnFranja = citasOcupadas.filter((c) => {
        const franjaCita = this.mapearHoraAFranja(c.hora_inicio);
        return franjaCita === franja;
      });

      // Filtrar soft locks activos (vigentes) que correspondan a esta franja
      const locksEnFranja = locksActivos.filter(
        (l) => l.franja === franja && !l.isExpired(),
      );

      // Si la franja está completamente libre de citas y locks
      if (citasEnFranja.length === 0 && locksEnFranja.length === 0) {
        return { franja, disponible: true };
      }

      // Regla de Negocio: Verificar si todas las citas existentes pertenecen a la misma sucursal
      const todasMismaSucursal = citasEnFranja.every(
        (c) => c.id_sucursal === id_sucursal_actual,
      );

      // Límite máximo de tickets/citas de la misma sucursal en un mismo bloque (máximo 3)
      const respetaLimiteSucursal = citasEnFranja.length < 3;

      // La franja solo está disponible si es de la misma sucursal, respeta el límite
      // y no existen bloqueos temporales de otro proceso (locksEnFranja vacíos o de la misma índole)
      const disponible =
        todasMismaSucursal &&
        respetaLimiteSucursal &&
        locksEnFranja.length === 0;

      return { franja, disponible };
    });
  }

  private mapearHoraAFranja(horaInicio: Date): string {
    // Extrae las horas de forma segura para hacer match con el bloque de 3 horas
    const hours = String(horaInicio.getUTCHours()).padStart(2, '0');
    if (hours.startsWith('09')) return '09:00 - 12:00';
    if (hours.startsWith('12')) return '12:00 - 15:00';
    if (hours.startsWith('15')) return '15:00 - 18:00';
    return '';
  }
}
