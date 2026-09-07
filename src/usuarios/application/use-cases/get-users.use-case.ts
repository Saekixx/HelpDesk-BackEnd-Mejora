import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
  PaginatedUsersResult,
} from '../../domain/ports/user.repository.port';
import { GetUsersFilterDto } from '../dtos/get-users-filter.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(
    filters: GetUsersFilterDto,
  ): Promise<
    Omit<PaginatedUsersResult, 'data'> & { data: Omit<any, 'password'>[] }
  > {
    // Obtener los usuarios filtrados desde el repositorio
    const result = await this.userRepository.findAllWithFilters(filters);

    // Omitir el campo password de la respuesta del listado
    const sanitizedData = result.data.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Devolver el resultado con los usuarios sin el campo password
    return {
      ...result,
      data: sanitizedData,
    };
  }
}
