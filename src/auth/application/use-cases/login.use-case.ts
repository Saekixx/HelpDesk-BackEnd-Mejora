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
    private readonly userRepository: UserRepositoryPort, // Inyecta el puerto del repositorio de usuarios
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort, // Inyecta el puerto del repositorio de roles
    @Inject(HASH_SERVICE) private readonly hashService: HashServicePort, // Inyecta el puerto del servicio de hash
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort, // Inyecta el puerto del servicio de token
  ) {}

  async execute(email: string, passwordPlain: string): Promise<LoginResponse> {
    // Buscar al usuario por correo electrónico
    const user = await this.userRepository.findByCorreo(email);
    // Si no se encuentra el usuario, lanzar una excepción de credenciales inválidas
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // Validar la contraseña usando el servicio de hash
    const isPasswordValid = await this.hashService.compare(
      passwordPlain,
      user.password,
    );

    // Si la contraseña no es válida, lanzar una excepción de credenciales inválidas
    if (!isPasswordValid)
      throw new UnauthorizedException('Credenciales inválidas');

    // Si la cuenta está desactivada, rechaza el login
    if (!user.is_active) throw new UnauthorizedException('Usuario inactivo');

    // Validar que el ID no sea null antes de firmar el token
    if (user.id_usuario === null)
      throw new UnauthorizedException('El usuario no posee un ID válido');

    // Generamos el token de acceso usando el servicio de token
    const token = await this.tokenService.generateToken({
      sub: String(user.id_usuario),
      email: user.correo,
    });

    // Obtener el rol del usuario para incluirlo en la respuesta
    const rol = await this.rolRepository.findById(user.id_rol);
    if (!rol) throw new UnauthorizedException('Rol no encontrado');

    // Retornar el token de acceso
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
