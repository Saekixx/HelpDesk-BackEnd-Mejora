import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: number) {
    // Obtenemos el usuario por su ID desde el repositorio
    const user = await this.userRepository.findById(id);

    // Si no se encuentra el usuario, lanzamos una excepción NotFoundException
    if (!user) throw new NotFoundException(`El usuario con ID ${id} no existe`);

    // Omitimos el campo password de la respuesta
    const { password, ...userWithoutPassword } = user;

    // Devolvemos el usuario sin el campo password
    return userWithoutPassword;
  }
}
