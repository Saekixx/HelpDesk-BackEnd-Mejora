// src/auth/application/use-cases/reset-password.use-case.ts
import {
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { User } from '@/usuarios/domain/entities/user.entity';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    let payload: { id_usuario: number };

    // Verificar firma y expiración del token
    try {
      payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('JWT_RESET_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'El enlace de recuperación es inválido o ha expirado',
      );
    }

    // Buscar usuario en la base de datos
    const currentUser = await this.userRepository.findById(payload.id_usuario);
    if (!currentUser) throw new NotFoundException('Usuario no encontrado');

    // Hashear la nueva contraseña
    const hashedPassword = await this.hashService.hash(dto.newPassword);

    // Reinstanciar la entidad User con los datos anteriores y la nueva contraseña
    const updatedUser = new User({
      id_usuario: currentUser.id_usuario,
      nombre: currentUser.nombre,
      apellido: currentUser.apellido,
      correo: currentUser.correo,
      password: hashedPassword,
      telefono: currentUser.telefono,
      is_active: currentUser.is_active,
      id_rol: currentUser.id_rol,
      id_cliente: currentUser.id_cliente,
      id_sucursal: currentUser.id_sucursal,
      id_area: currentUser.id_area,
    });

    // Guardar la entidad actualizada en BD
    await this.userRepository.save(updatedUser);

    return { message: 'Contraseña actualizada con éxito' };
  }
}
