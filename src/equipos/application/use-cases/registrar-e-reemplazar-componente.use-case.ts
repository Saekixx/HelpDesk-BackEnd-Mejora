import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { RegistrarReemplazarComponenteDto } from '@/equipos/domain/dto/registrar-reemplazar-componente.dto';
import {
  EquipoInactivoParaComponentesException,
  EquipoNotFoundException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class RegistrarEReemplazarComponenteUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  /**
   * Reemplaza un componente instalado en el equipo por uno nuevo que se
   * registra en el mismo acto.
   *
   * Reglas de este caso de uso: el equipo debe existir y estar activo. Que el
   * componente actual esté instalado en este equipo, la unicidad del número
   * de serie y la existencia del técnico las valida el repositorio dentro de
   * la misma transacción que retira el componente actual y crea el nuevo.
   *
   * Errores de dominio: 404 si el equipo, el componente actual (o no está
   * instalado en este equipo) o el técnico no existen, y 409 si el equipo
   * está desactivado o el número de serie ya está registrado.
   */
  async execute(
    idEquipo: number,
    idHardwareActual: number,
    dto: RegistrarReemplazarComponenteDto,
    idTecnico?: number,
  ): Promise<void> {
    const equipo = await this.equipoRepository.findById(idEquipo);
    if (!equipo) throw new EquipoNotFoundException();
    if (!equipo.is_active) throw new EquipoInactivoParaComponentesException();

    await this.equipoRepository.registrarEReemplazarComponente(
      idEquipo,
      idHardwareActual,
      {
        tipoComponente: dto.tipo_componente,
        marcaModelo: dto.marca_modelo,
        numeroSerie: dto.numero_serie,
        proveedor: dto.proveedor,
        fechaCompra: dto.fecha_compra ? new Date(dto.fecha_compra) : undefined,
        urlFactura: dto.url_factura,
        fechaReemplazo: new Date(dto.fecha_reemplazo),
        observaciones: dto.observaciones,
        idTecnico,
      },
    );
  }
}
