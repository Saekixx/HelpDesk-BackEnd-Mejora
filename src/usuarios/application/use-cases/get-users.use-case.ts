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

  async execute(filters: GetUsersFilterDto): Promise<PaginatedUsersResult> {
    return await this.userRepository.findAllWithFilters(filters);
  }
}
