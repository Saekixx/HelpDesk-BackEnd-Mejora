import { Hardware } from '../entities/hardware.entity';
import { FilterHardwareDto } from '../../application/dtos/filter-hardware.dto';
import { GetHardwareOptionsQueryDto } from '../../application/dtos/get-hardware-options.query.dto';
import { HardwareOptionResponseDto } from '../../application/dtos/hardware-option-response.dto';

export const HARDWARE_REPOSITORY = 'HARDWARE_REPOSITORY';

// Datos de una transición de estado ya validada por el dominio.
export interface TransitionHardwareParams {
  // Hardware tal como se leyó antes de la transición.
  anterior: Hardware;
  // Hardware resultante (estado y equipo destino ya aplicados).
  nuevo: Hardware;
  // Observación de la intervención, para la trazabilidad.
  motivo: string;
  // Técnico que realiza la intervención, si se conoce.
  id_tecnico_resp?: number;
}

export interface HardwareRepositoryPort {
  /**
   * Registra un hardware nuevo. Si trae `id_equipo_actual` crea, en la misma
   * transacción, el registro activo en `registro_hardware`.
   */
  create(hardware: Hardware): Promise<Hardware>;
  update(hardware: Hardware): Promise<Hardware>;
  /**
   * Aplica una transición de estado de forma atómica: actualiza el hardware,
   * cierra sus movimientos abiertos en `registro_hardware` y, si queda
   * instalado, registra el nuevo movimiento. Devuelve el hardware con su
   * equipo actual y ubicación (cliente, sucursal, área).
   * Lanza HardwareModificadoConcurrentementeException si el hardware cambió
   * (o fue eliminado) desde que se leyó `anterior`.
   */
  transition(params: TransitionHardwareParams): Promise<Hardware>;
  existeEquipo(id_equipo: number): Promise<boolean>;
  findAll(filterDto: FilterHardwareDto): Promise<{
    data: Hardware[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>;
  /**
   * Hardware con su equipo actual (cliente, sucursal, área) y su historial de
   * movimientos, del más reciente al más antiguo. null si no existe.
   */
  findById(id: number): Promise<Hardware | null>;
  /**
   * Listado simplificado (sin paginación) para selectores y autocompletados,
   * con filtros opcionales por estado, tipo de componente y equipo actual.
   */
  findOptions(
    filters: GetHardwareOptionsQueryDto,
  ): Promise<HardwareOptionResponseDto[]>;
}
