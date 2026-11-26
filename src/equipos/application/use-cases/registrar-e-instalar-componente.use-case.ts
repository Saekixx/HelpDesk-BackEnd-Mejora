import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { RegistrarInstalarComponenteDto } from '@/equipos/domain/dto/registrar-instalar-componente.dto';
import {
  EquipoInactivoParaComponentesException,
  EquipoNotFoundException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class RegistrarEInstalarComponenteUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  /**
   * Registra un componente nuevo y lo deja instalado en el equipo.
   *
   * Reglas de este caso de uso: el equipo debe existir y estar activo (un
   * equipo desactivado está "Retirado"). La unicidad del número de serie y la
   * existencia del técnico las valida el repositorio dentro de la misma
   * transacción que crea el componente y su movimiento.
   *
   * Errores de dominio: 404 si el equipo o el técnico no existen, y 409 si el
   * equipo está desactivado o el número de serie ya está registrado.
   */
  async execute(
    idEquipo: number,
    dto: RegistrarInstalarComponenteDto,
    idTecnico?: number,
  ): Promise<void> {
    const equipo = await this.equipoRepository.findById(idEquipo);
    if (!equipo) throw new EquipoNotFoundException();
    if (!equipo.is_active) throw new EquipoInactivoParaComponentesException();

    await this.equipoRepository.registrarEInstalarComponente(idEquipo, {
      tipoComponente: dto.tipo_componente,
      marcaModelo: dto.marca_modelo,
      numeroSerie: dto.numero_serie,
      proveedor: dto.proveedor,
      fechaCompra: dto.fecha_compra ? new Date(dto.fecha_compra) : undefined,
      urlFactura: dto.url_factura,
      fechaInstalacion: new Date(dto.fecha_instalacion),
      observaciones: dto.observaciones,
      idTecnico,
    });
  }
}
