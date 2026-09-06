import { Inject, Injectable, ConflictException } from '@nestjs/common';
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
import { User } from '@/usuarios/domain/entities/user.entity';
import { RegisterCommand } from '../dtos/register.dto';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
    @Inject(HASH_SERVICE) private readonly hashService: HashServicePort,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenServicePort,
  ) {}

  async execute(command: RegisterCommand): Promise<{ accessToken: string }> {
    // Validamos si el correo ya está registrado
    const existingUser = await this.userRepository.findByCorreo(command.correo);
    // Si el usuario ya existe, lanzamos una excepción de conflicto
    if (existingUser)
      throw new ConflictException('El correo ya se encuentra registrado');

    // Validamos si el rol existe
    const existingRol = await this.rolRepository.findById(command.id_rol);
    // Si el rol no existe, lanzamos una excepción de conflicto
    if (!existingRol) throw new ConflictException('El rol no existe');

    // Hasheamos la contraseña
    const hashedPassword = await this.hashService.hash(command.password);

    // Creamos la entidad de Dominio
    const newUser = new User(
      null, // ID autogenerado en BD
      command.nombre,
      command.apellido,
      command.correo,
      hashedPassword,
      command.telefono,
      true, // estado activo por defecto
      command.id_rol,
      command.id_cliente ?? null,
      command.id_sucursal ?? null,
      command.id_area ?? null,
    );

    // Guardamos el usuario en la base de datos a través del puerto
    const savedUser = await this.userRepository.save(newUser);

    // Validamos que el usuario se haya guardado correctamente y tenga un ID asignado
    if (savedUser.id_usuario === null)
      throw new Error('Error al registrar el usuario');

    // Generamos el token de acceso inmediato
    const accessToken = await this.tokenService.generateToken({
      sub: String(savedUser.id_usuario),
      email: savedUser.correo,
    });

    // Retornamos el token de acceso
    return { accessToken };
  }
}
