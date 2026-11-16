import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import {
  CLIENTE_REPOSITORY,
  ClienteRepositoryPort,
} from '@/clientes/domain/ports/cliente.repository.port';
import {
  SUCURSAL_REPOSITORY,
  SucursalRepositoryPort,
} from '@/clientes/domain/ports/sucursal.repository.port';
import {
  AREA_REPOSITORY,
  AreaRepositoryPort,
} from '@/clientes/domain/ports/area.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { EquipoCreadoItem } from '@/equipos/domain/entities/equipo.entity';
import { CreateEquipoDto } from '@/equipos/domain/dto/create-equipo.dto';
import { EstadoEquipo } from '@/equipos/domain/enums/estado-equipo.enum';
import {
  AreaEquipoNoDisponibleException,
  AreaNoPerteneceASucursalException,
  ClienteEquipoNoDisponibleException,
  EquipoAlreadyExistsException,
  SucursalEquipoNoDisponibleException,
  SucursalNoPerteneceAClienteException,
  TrabajadorEquipoNoDisponibleException,
  TrabajadorNoPerteneceAClienteException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class CreateEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepositoryPort,
    @Inject(SUCURSAL_REPOSITORY)
    private readonly sucursalRepository: SucursalRepositoryPort,
    @Inject(AREA_REPOSITORY)
    private readonly areaRepository: AreaRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateEquipoDto): Promise<EquipoCreadoItem> {
    const tieneTrabajador = dto.id_trabajador != null;

    // Las consultas son independientes: se lanzan en paralelo y las reglas se
    // evalúan después, en orden, para devolver siempre el primer error lógico.
    const [numSerieEnUso, cliente, sucursal, area, trabajador] =
      await Promise.all([
        this.equipoRepository.existsByNumSerie(dto.num_serie),
        this.clienteRepository.findById(dto.id_cliente),
        this.sucursalRepository.findById(dto.id_sucursal),
        this.areaRepository.findById(dto.id_area),
        tieneTrabajador
          ? this.userRepository.findById(dto.id_trabajador as number)
          : null,
      ]);

    if (numSerieEnUso) throw new EquipoAlreadyExistsException();

    // Jerarquía organizacional: cliente > sucursal > área
    if (!cliente?.is_active) throw new ClienteEquipoNoDisponibleException();

    if (!sucursal?.is_active) throw new SucursalEquipoNoDisponibleException();
    if (sucursal.id_cliente !== dto.id_cliente) {
      throw new SucursalNoPerteneceAClienteException();
    }

    if (!area?.is_active) throw new AreaEquipoNoDisponibleException();
    if (area.id_sucursal !== dto.id_sucursal) {
      throw new AreaNoPerteneceASucursalException();
    }

    // Trabajador asignado (opcional): activo y, si tiene cliente, el mismo
    if (tieneTrabajador) {
      if (!trabajador?.is_active) {
        throw new TrabajadorEquipoNoDisponibleException();
      }
      if (trabajador.id_cliente && trabajador.id_cliente !== dto.id_cliente) {
        throw new TrabajadorNoPerteneceAClienteException();
      }
    }

    return await this.equipoRepository.create({
      ...dto,
      estado: tieneTrabajador ? EstadoEquipo.ACTIVO : EstadoEquipo.EN_ALMACEN,
      is_active: true,
    });
  }
}
