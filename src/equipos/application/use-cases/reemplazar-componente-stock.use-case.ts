import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { ReemplazarComponenteStockDto } from '@/equipos/domain/dto/reemplazar-componente-stock.dto';
import {
  EquipoInactivoParaComponentesException,
  EquipoNotFoundException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class ReemplazarComponenteStockUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  /**
   * Reemplaza un componente instalado en el equipo por otro que está en stock
   * ("Disponible").
   *
   * Reglas de este caso de uso: el equipo debe existir y estar activo. Que el
   * componente actual esté instalado en este equipo, que el nuevo exista y
   * esté disponible, y que el técnico exista, los valida el repositorio
   * dentro de la transacción que retira el componente actual y monta el
   * nuevo.
   *
   * Errores de dominio: 404 si el equipo, el componente actual (o no está
   * instalado en este equipo), el componente nuevo o el técnico no existen, y
   * 409 si el equipo está desactivado o el componente nuevo no está
   * disponible.
   */
  async execute(
    idEquipo: number,
    idHardwareActual: number,
    dto: ReemplazarComponenteStockDto,
    idTecnico?: number,
  ): Promise<void> {
    const equipo = await this.equipoRepository.findById(idEquipo);
    if (!equipo) throw new EquipoNotFoundException();
    if (!equipo.is_active) throw new EquipoInactivoParaComponentesException();

    await this.equipoRepository.reemplazarComponenteStock(
      idEquipo,
      idHardwareActual,
      dto.id_hardware_nuevo,
      new Date(dto.fecha_reemplazo),
      dto.observaciones,
      idTecnico,
    );
  }
}
