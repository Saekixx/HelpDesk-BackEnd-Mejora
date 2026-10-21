import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import {
  HASH_SERVICE,
  HashServicePort,
} from '../../domain/ports/hash.service.port';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../../domain/ports/token.service.port';
import { LoginResponse } from '../dtos/login.response';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(email: string, passwordPlain: string): Promise<LoginResponse> {
    // Buscar al usuario por correo electrónico
    const user = await this.userRepository.findByCorreo(email);

    // Validar que el usuario exista y tenga una contraseña
    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Validar la contraseña
    const isPasswordValid = await this.hashService.compare(
      passwordPlain,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que la cuenta esté activa
    if (!user.is_active) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Validar el ID del usuario
    if (user.id_usuario == null) {
      throw new UnauthorizedException('El usuario no posee un ID válido');
    }

    // Obtener el rol del usuario
    const rol = await this.rolRepository.findById(user.id_rol);

    if (!rol) {
      throw new UnauthorizedException('Rol no encontrado');
    }

    // Generar el token con el rol y el contexto del usuario
    const token = await this.tokenService.generateToken({
      sub: String(user.id_usuario),
      email: user.correo,
      role: rol.nombre,
      clienteId: user.id_cliente ?? undefined,
      sucursalId: user.id_sucursal ?? undefined,
      nombre: user.nombre,
    });

    // Retornar el token y los datos del usuario
    return {
      token,
      user: {
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        role: rol.nombre,
        id_empresa: user.id_cliente ?? null,
        id_sucursal: user.id_sucursal ?? null,
        id_area: user.id_area ?? null,
      },
    };
  }
}