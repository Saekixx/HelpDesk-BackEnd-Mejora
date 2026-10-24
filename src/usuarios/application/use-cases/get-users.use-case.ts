import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
  PaginatedUsersResult,
} from '../../domain/ports/user.repository.port';
import { UserFilterCriteria } from '../../domain/criteria/user-filter.criteria';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(filters: UserFilterCriteria): Promise<PaginatedUsersResult> {
    return await this.userRepository.findAllWithFilters(filters);
  }
}
