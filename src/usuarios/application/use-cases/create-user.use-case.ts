// src/usuarios/application/use-cases/create-user.use-case.ts
import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort, // Inyecta el puerto del repositorio de usuarios
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort, // Inyecta el puerto del repositorio de roles
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort, // Inyecta el puerto del servicio de hash
  ) {}

  async execute(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Validar si el correo ya está registrado
    const existingUser = await this.userRepository.findByCorreo(dto.correo);
    if (existingUser)
      throw new ConflictException('El correo electrónico ya está registrado');

    // Validar si el rol existe
    const existingRol = await this.rolRepository.findById(dto.id_rol);
    if (!existingRol)
      throw new ConflictException('El rol especificado no existe');

    // Hashear la contraseña
    const hashedPassword = await this.hashService.hash(dto.password);

    // Crear instancia del Modelo de Dominio
    const newUser = new User(
      null, // El ID será generado por la base de datos
      dto.nombre,
      dto.apellido,
      dto.correo,
      hashedPassword,
      dto.telefono,
      true, // estado activo por defecto
      dto.id_rol,
      dto.id_cliente ?? null,
      dto.id_sucursal ?? null,
      dto.id_area ?? null,
    );

    // Guardamos en la base de datos a través del Puerto
    const savedUser = await this.userRepository.save(newUser);

    // Excluir la contraseña de la respuesta de retorno
    const { password, ...userWithoutPassword } = savedUser;

    return userWithoutPassword;
  }
}
