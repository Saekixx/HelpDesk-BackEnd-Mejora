import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { UserOption } from '../dtos/user-options.dto';
import { UserSelectFilter } from '../dtos/user-select-filter-dto';

@Injectable()
export class GetUserOptionUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(filters: UserSelectFilter): Promise<UserOption[]> {
    return await this.userRepository.findActiveRolUsers(filters);
  }
}
