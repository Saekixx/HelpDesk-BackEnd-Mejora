import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { MontarComponenteStockDto } from '@/equipos/domain/dto/montar-componente-stock.dto';
import {
  EquipoInactivoParaComponentesException,
  EquipoNotFoundException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class MontarComponenteStockUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  /**
   * Monta en el equipo un componente que está en stock ("Disponible").
   *
   * Reglas de este caso de uso: el equipo debe existir y estar activo (un
   * equipo desactivado está "Retirado": toggleEstado mantiene ambos datos
   * sincronizados). Que el componente exista y esté disponible, y que el
   * técnico exista, los valida el repositorio dentro de la transacción para
   * que la reserva sea atómica.
   *
   * Errores de dominio: 404 si el equipo, el componente o el técnico no
   * existen, y 409 si el equipo está desactivado o el componente no está
   * disponible.
   */
  async execute(
    idEquipo: number,
    dto: MontarComponenteStockDto,
    idTecnico?: number,
  ): Promise<void> {
    const equipo = await this.equipoRepository.findById(idEquipo);
    if (!equipo) throw new EquipoNotFoundException();
    if (!equipo.is_active) throw new EquipoInactivoParaComponentesException();

    await this.equipoRepository.montarComponenteStock(
      idEquipo,
      dto.id_hardware,
      new Date(dto.fecha_instalacion),
      dto.observaciones,
      idTecnico,
    );
  }
}
