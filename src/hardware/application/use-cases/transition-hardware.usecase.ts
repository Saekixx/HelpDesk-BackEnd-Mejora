import { Inject, Injectable } from '@nestjs/common';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import {
  EquipoDestinoNotFoundException,
  HardwareNotFoundException,
} from '@/hardware/domain/exceptions/hardware.exceptions';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { TransitionHardwareDto } from '../dtos/transition-hardware.dto';

@Injectable()
export class TransitionHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  /**
   * Cambia el estado de un hardware dejando trazabilidad en su hoja de vida.
   * Devuelve el hardware con su equipo actual y ubicación ya actualizados.
   *
   * Errores de dominio: 404 si el hardware o el equipo destino no existen,
   * 400 si falta el equipo al instalar y 409 si la transición no es válida o
   * el hardware cambió mientras se aplicaba.
   */
  async execute(
    id: number,
    dto: TransitionHardwareDto,
    id_tecnico_resp?: number,
  ): Promise<Hardware> {
    const anterior = await this.hardwareRepository.findById(id);
    if (!anterior) throw new HardwareNotFoundException(id);

    // Reglas de transición: no toca la base de datos.
    const nuevo = anterior.transicionarA(dto.estado, dto.id_equipo);

    // `nuevo.id_equipo_actual` solo tiene valor al instalar: ahí el equipo
    // destino debe existir.
    if (nuevo.id_equipo_actual !== null) {
      const existe = await this.hardwareRepository.existeEquipo(
        nuevo.id_equipo_actual,
      );
      if (!existe) {
        throw new EquipoDestinoNotFoundException(nuevo.id_equipo_actual);
      }
    }

    return this.hardwareRepository.transition({
      anterior,
      nuevo,
      motivo: dto.motivo,
      id_tecnico_resp,
    });
  }
}
