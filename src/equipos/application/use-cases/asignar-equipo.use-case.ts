import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { AsignarEquipoDto } from '@/equipos/domain/dto/asignar-equipo.dto';
import {
  EquipoInactivoException,
  EquipoNotFoundException,
  TrabajadorEquipoNoDisponibleException,
  TrabajadorNoPerteneceAClienteException,
} from '@/equipos/domain/exceptions/equipo.exceptions';

@Injectable()
export class AsignarEquipoUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  /**
   * Asigna el equipo a un trabajador y lo deja "Activo", guardando las
   * observaciones si se envían.
   *
   * Errores de dominio: 404 si el equipo no existe o el trabajador no existe
   * o está inactivo, 409 si el equipo está desactivado y 400 si el trabajador
   * pertenece a otro cliente.
   */
  async execute(id: number, dto: AsignarEquipoDto): Promise<void> {
    // Las consultas son independientes: se lanzan en paralelo y las reglas se
    // evalúan después, en orden, para devolver siempre el primer error lógico.
    const [equipo, trabajador] = await Promise.all([
      this.equipoRepository.findById(id),
      this.userRepository.findById(dto.id_trabajador),
    ]);

    if (!equipo) throw new EquipoNotFoundException();
    // Asignar deja el equipo en "Activo": un equipo desactivado no se reactiva
    // por esta vía (eso es toggle-status).
    if (!equipo.is_active) throw new EquipoInactivoException();

    if (!trabajador?.is_active) {
      throw new TrabajadorEquipoNoDisponibleException();
    }
    // Debe ser del mismo cliente que el equipo (ambos sin cliente también
    // coinciden).
    if ((trabajador.id_cliente ?? null) !== (equipo.id_cliente ?? null)) {
      throw new TrabajadorNoPerteneceAClienteException();
    }

    await this.equipoRepository.assign(
      id,
      dto.id_trabajador,
      dto.observaciones,
    );
  }
}
