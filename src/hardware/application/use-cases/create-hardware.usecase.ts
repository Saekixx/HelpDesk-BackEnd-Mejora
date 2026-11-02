import { Inject, Injectable } from '@nestjs/common';
import {
  HARDWARE_REPOSITORY,
  HardwareRepositoryPort,
} from '@/hardware/domain/ports/hardware.repository.port';
import { Hardware } from '@/hardware/domain/entities/hardware.entity';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import { UbicacionInicial } from '@/hardware/domain/enums/ubicacion-inicial.enum';
import {
  EquipoDestinoNotFoundException,
  EquipoDestinoRequeridoException,
} from '@/hardware/domain/exceptions/hardware.exceptions';
import { CreateHardwareDto } from '../dtos/create-hardware.dto';

@Injectable()
export class CreateHardwareUseCase {
  constructor(
    @Inject(HARDWARE_REPOSITORY)
    private readonly hardwareRepository: HardwareRepositoryPort,
  ) {}

  async execute(dto: CreateHardwareDto): Promise<Hardware> {
    const id_equipo_destino = await this.resolverEquipoDestino(dto);
    const instalar = id_equipo_destino !== null;

    const newHardware = new Hardware({
      tipo_componente: dto.tipo_componente,
      numero_serie: dto.numero_serie,
      marca_modelo: dto.marca_modelo,
      proveedor: dto.proveedor,
      fecha_compra: dto.fecha_compra ? new Date(dto.fecha_compra) : undefined,
      costo_unitario: dto.costo_unitario,
      url_factura: dto.url_factura,
      // ALMACEN_CENTRAL -> DISPONIBLE sin equipo; INSTALAR_EQUIPO -> INSTALADO.
      estado: instalar ? EstadoHardware.INSTALADO : EstadoHardware.DISPONIBLE,
      id_equipo_actual: id_equipo_destino,
    });

    // El repositorio crea el registro_hardware solo si hay equipo asignado.
    return this.hardwareRepository.create(newHardware);
  }

  /**
   * Devuelve el equipo donde se instalará, o null si va al almacén central.
   * Al instalar valida que el equipo destino exista.
   */
  private async resolverEquipoDestino(
    dto: CreateHardwareDto,
  ): Promise<number | null> {
    if (dto.ubicacion_inicial !== UbicacionInicial.INSTALAR_EQUIPO) {
      return null;
    }

    if (dto.id_equipo_destino === undefined) {
      throw new EquipoDestinoRequeridoException();
    }

    const existe = await this.hardwareRepository.existeEquipo(
      dto.id_equipo_destino,
    );
    if (!existe) {
      throw new EquipoDestinoNotFoundException(dto.id_equipo_destino);
    }

    return dto.id_equipo_destino;
  }
}
