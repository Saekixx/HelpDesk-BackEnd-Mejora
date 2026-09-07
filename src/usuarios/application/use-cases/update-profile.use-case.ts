import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usuarioRepository: UserRepositoryPort, // Inyecta el puerto del repositorio de usuarios
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort, // Inyecta el puerto del servicio de hash
  ) {}

  async execute(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<void> {
    // Validar que el usuario exista en la base de datos
    const user: any = await this.usuarioRepository.findById(Number(userId));
    // Si el usuario no existe, lanzar un error
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificar que la contraseña actual proporcionada coincida con la almacenada en la base de datos
    const isPasswordValid = await this.hashService.compare(
      updateProfileDto.currentPassword,
      user.password,
    );

    // Si la contraseña no es válida, lanzar un error
    if (!isPasswordValid)
      throw new UnauthorizedException('Contraseña actual incorrecta');

    // Si se proporciona una nueva contraseña, hashearla y actualizarla en el perfil del usuario
    if (updateProfileDto.newPassword) {
      const hashedNewPassword = await this.hashService.hash(
        updateProfileDto.newPassword,
      );
      user.password = hashedNewPassword;
    }

    // Si se proporciona un nuevo correo electrónico, verificar que no esté en uso por otro usuario
    if (updateProfileDto.email) {
      const existingUser = await this.usuarioRepository.findByCorreo(
        updateProfileDto.email,
      );
      if (existingUser && existingUser.id_usuario !== user.id) {
        throw new UnauthorizedException('El correo electrónico ya está en uso');
      }
      user.email = updateProfileDto.email;
    }

    // Actualizar los campos del perfil del usuario si se proporcionan
    if (updateProfileDto.nombre) user.nombre = updateProfileDto.nombre;
    if (updateProfileDto.apellido) user.apellido = updateProfileDto.apellido;
    if (updateProfileDto.telefono) user.telefono = updateProfileDto.telefono;
    await this.usuarioRepository.save(user);
  }
}
