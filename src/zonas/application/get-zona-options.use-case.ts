import { Inject, Injectable } from '@nestjs/common';
import {
  ZONA_REPOSITORY,
  ZonaRepositoryPort,
} from '../domain/ports/zona.repository.port';

@Injectable()
export class GetZonaOptionsUseCase {
  constructor(
    @Inject(ZONA_REPOSITORY)
    private readonly zonaRepository: ZonaRepositoryPort,
  ) {}

  async execute(): Promise<{ id_zona: number; nombre_zona: string }[]> {
    return this.zonaRepository.findOptions();
  }
}
