import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  CITA_SOPORTE_REPOSITORY,
  CitaSoporteRepositoryPort,
} from '@/citas/domain/port/cita-soporte.repository.port';
import {
  SOFT_LOCK_REPOSITORY,
  SoftLockRepositoryPort,
} from '@/citas/domain/port/soft-lock.repository.port';
import { AutoAssignResultDto } from '../../dtos/citas/auto-assign-response.dto';
import { UserRole } from '@/usuarios/domain/enum/user-role.enum';

@Injectable()
export class AutoAssignInsituUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CITA_SOPORTE_REPOSITORY)
    private readonly citaRepository: CitaSoporteRepositoryPort,
    @Inject(SOFT_LOCK_REPOSITORY)
    private readonly softLockRepository: SoftLockRepositoryPort,
  ) {}

  async execute(dto: {
    id_sucursal: number;
    fecha: string; // Formato 'YYYY-MM-DD'
  }): Promise<AutoAssignResultDto> {
    const fechaDate = new Date(`${dto.fecha}T00:00:00`);
    const franjasEstandar = ['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00'];

    // Obtener la sucursal y su zona geográfica asociada
    const sucursal = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: dto.id_sucursal },
      include: { zonas: true },
    });

    if (!sucursal || !sucursal.id_zona) {
      throw new NotFoundException(
        'La sucursal no existe o no tiene una zona geográfica asignada.',
      );
    }

    // Etapa 1: Filtro por Zona (Técnicos SOPORTE_INSITU de la zona)
    const tecnicosEnZona = await this.prisma.tecnicos_zonas.findMany({
      where: { id_zona: sucursal.id_zona },
      include: {
        usuarios: {
          include: { rol: true },
        },
      },
    });

    // Filtrar únicamente aquellos usuarios que sean de soporte presencial (SOPORTE_INSITU)
    const tecnicosDisponibles = tecnicosEnZona
      .map((tz) => tz.usuarios)
      .filter((u) => u.is_active && u.rol?.nombre === UserRole.SOPORTE_INSITU);

    if (tecnicosDisponibles.length === 0) {
      throw new NotFoundException(
        'No hay técnicos de soporte in-situ disponibles en la zona de esta sucursal.',
      );
    }

    // Evaluar agendas y cargas de todos los técnicos para la fecha seleccionada
    const evaluacionTecnicos = [];

    for (const tecnico of tecnicosDisponibles) {
      // Obtener citas y locks del técnico en la fecha
      const citasTecnico = await this.citaRepository.findByTecnicoAndFecha(
        tecnico.id_usuario,
        fechaDate,
      );
      const locksTecnico = await this.softLockRepository.findByTecnicoAndFecha(
        tecnico.id_usuario,
        fechaDate,
      );

      // Revisar si este técnico ya tiene citas o locks en la MISMA SUCURSAL el día de hoy
      const citasMismaSucursal = citasTecnico.filter(
        (c) => c.id_sucursal === dto.id_sucursal,
      );

      evaluacionTecnicos.push({
        tecnico,
        citasTecnico,
        locksTecnico,
        citasMismaSucursal,
        cargaTotal:
          citasTecnico.length +
          locksTecnico.filter((l) => !l.isExpired()).length,
      });
    }

    // Etapa 4: Priorización por Afinidad de Sucursal (Llenar el bloque existente)
    for (const evalItem of evaluacionTecnicos) {
      if (evalItem.citasMismaSucursal.length > 0) {
        // Encontramos un técnico que ya va a esa sucursal. Busquemos su franja.
        for (const citaExistente of evalItem.citasMismaSucursal) {
          const franjaCita = this.mapearHoraAFranja(citaExistente.hora_inicio);

          // Contar cuántos tickets hay en esa franja específica para esa sucursal
          const ticketsEnFranja = evalItem.citasTecnico.filter(
            (c) =>
              c.id_sucursal === dto.id_sucursal &&
              this.mapearHoraAFranja(c.hora_inicio) === franjaCita,
          ).length;

          // Regla: Si la franja tiene menos de 3 tickets, agrupamos aquí obligatoriamente
          if (ticketsEnFranja < 3 && franjasEstandar.includes(franjaCita)) {
            return {
              id_tecnico: evalItem.tecnico.id_usuario,
              nombre_tecnico: `${evalItem.tecnico.nombre} ${evalItem.tecnico.apellido}`,
              franja_recomendada: franjaCita,
              motivo_asignacion: `Se asignó a ${evalItem.tecnico.nombre} ${evalItem.tecnico.apellido} para la franja ${franjaCita} porque ya cuenta con ${ticketsEnFranja} ticket(s) programado(s) en la misma sucursal ("${sucursal.nombre_sucursal}") para esta fecha. ¡Se optimiza el desplazamiento!`,
              es_agrupado_por_sucursal: true,
            };
          }
        }
      }
    }

    // Etapa 2 y 3: Asignación por Menor Carga y Espacio Libre (Fallback general)
    // Ordenar técnicos de menor a mayor carga de trabajo en el día
    evaluacionTecnicos.sort((a, b) => a.cargaTotal - b.cargaTotal);

    for (const evalItem of evaluacionTecnicos) {
      // Buscar la primera franja libre (que no tenga citas ni locks vigentes)
      for (const franja of franjasEstandar) {
        const ocupadaPorCita = evalItem.citasTecnico.some(
          (c) => this.mapearHoraAFranja(c.hora_inicio) === franja,
        );
        const ocupadaPorLock = evalItem.locksTecnico.some(
          (l) => l.franja === franja && !l.isExpired(),
        );

        if (!ocupadaPorCita && !ocupadaPorLock) {
          return {
            id_tecnico: evalItem.tecnico.id_usuario,
            nombre_tecnico: `${evalItem.tecnico.nombre} ${evalItem.tecnico.apellido}`,
            franja_recomendada: franja,
            motivo_asignacion: `No se encontraron visitas previas en esta sucursal para la fecha. Se asignó automáticamente a ${evalItem.tecnico.nombre} ${evalItem.tecnico.apellido} (${franja}) por tener la menor carga operativa en la zona (${evalItem.cargaTotal} ticket(s) activos).`,
            es_agrupado_por_sucursal: false,
          };
        }
      }
    }

    // Si todos los técnicos están completamente llenos en todas las franjas
    throw new NotFoundException(
      'Todos los técnicos de soporte in-situ en esta zona se encuentran sin disponibilidad (franjas llenas) para la fecha seleccionada.',
    );
  }

  private mapearHoraAFranja(horaInicio: Date): string {
    const hours = String(horaInicio.getUTCHours()).padStart(2, '0');
    if (hours.startsWith('09')) return '09:00 - 12:00';
    if (hours.startsWith('12')) return '12:00 - 15:00';
    if (hours.startsWith('15')) return '15:00 - 18:00';
    return '';
  }
}
