import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { UserStatsResponseDto } from '../dtos/user-stats-response.dto';

@Injectable()
export class GetUserStatsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(): Promise<UserStatsResponseDto> {
    return await this.userRepository.getUserStats();
  }
}
