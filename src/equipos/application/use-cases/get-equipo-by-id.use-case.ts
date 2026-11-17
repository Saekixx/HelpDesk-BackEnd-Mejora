import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPO_REPOSITORY,
  EquipoRepositoryPort,
} from '@/equipos/domain/ports/equipo.repository.port';
import { EquipoDetail } from '@/equipos/domain/entities/equipo.entity';
import { EquipoNotFoundException } from '@/equipos/domain/exceptions/equipo.exceptions';
import { RolEnum } from '@/auth/domain/enums/rol.enum';

// Valor que reemplaza a las contraseñas de licencias para quien no es admin.
export const PASSWORD_ENMASCARADA = '**********';

@Injectable()
export class GetEquipoByIdUseCase {
  constructor(
    @Inject(EQUIPO_REPOSITORY)
    private readonly equipoRepository: EquipoRepositoryPort,
  ) {}

  // `solicitante` es el usuario autenticado (basta con su rol). Solo el
  // ADMINISTRADOR ve las contraseñas de las licencias; para el resto se
  // enmascaran (si no hay contraseña, sigue siendo null).
  async execute(
    id: number,
    solicitante: { role: string },
  ): Promise<EquipoDetail> {
    const equipo = await this.equipoRepository.findDetailById(id);

    if (!equipo) throw new EquipoNotFoundException();
    if (solicitante.role === RolEnum.ADMINISTRADOR) return equipo;

    return {
      ...equipo,
      software: equipo.software.map((licencia) => ({
        ...licencia,
        password_enc: licencia.password_enc ? PASSWORD_ENMASCARADA : null,
      })),
    };
  }
}
