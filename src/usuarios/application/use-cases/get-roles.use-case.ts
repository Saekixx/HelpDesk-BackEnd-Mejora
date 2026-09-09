import { Rol } from '@/usuarios/domain/entities/rol.entity';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetRolesUseCase {
  constructor(
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
  ) {}

  async execute(): Promise<Rol[]> {
    return await this.rolRepository.findAll();
  }
}
