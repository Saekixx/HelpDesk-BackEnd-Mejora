import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import { UserNotFoundException } from '@/usuarios/domain/exceptions/user.exceptions';
import { User } from '@/usuarios/domain/entities/user.entity';

@Injectable()
export class ToggleUserStatusUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(targetUserId: number, currentUserId: number): Promise<string> {
    const targetId = Number(targetUserId);
    const currentId = Number(currentUserId);

    // Validar que el usuario no intente desactivar su propia cuenta
    if (targetId === currentId)
      throw new BadRequestException('No puedes desactivar tu propia cuenta');

    // Validar existencia del usuario objetivo pasándole el ID numérico
    const user = await this.userRepository.findById(targetId);
    if (!user) throw new UserNotFoundException();

    // Cambiar el estado activo del usuario
    const newStatus = !user.is_active;
    const updatedUser = new User({
      ...user,
      is_active: newStatus,
    });

    // Guardar los cambios en el repositorio
    await this.userRepository.save(updatedUser);

    // Devolver un mensaje indicando el nuevo estado del usuario
    const action = newStatus ? 'activado' : 'desactivado';
    return `Usuario ${action} correctamente`;
  }
}
