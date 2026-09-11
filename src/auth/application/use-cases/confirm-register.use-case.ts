import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConfirmRegisterDto } from '../dtos/confirm-register.dto';
import { User } from '@/usuarios/domain/entities/user.entity';

@Injectable()
export class ConfirmRegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: ConfirmRegisterDto): Promise<Omit<User, 'password'>> {
    let payload: any;

    // Verificar firma y expiración del token
    try {
      payload = this.jwtService.verify(dto.token, {
        secret: this.configService.get<string>('JWT_EMAIL_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'El enlace de verificación es inválido o ha expirado',
      );
    }

    // Verificar por seguridad que no haya sido registrado previamente
    const existingUser = await this.userRepository.findByCorreo(payload.correo);
    if (existingUser) {
      throw new ConflictException(
        'Esta cuenta ya ha sido confirmada previamente',
      );
    }

    // Hashear la nueva contraseña ingresada por el usuario
    const hashedPassword = await this.hashService.hash(dto.password);

    // Instanciar e Insertar la entidad en la base de datos
    const newUser = new User({
      nombre: payload.nombre,
      apellido: payload.apellido,
      correo: payload.correo,
      password: hashedPassword,
      telefono: payload.telefono,
      is_active: true,
      id_rol: payload.id_rol,
      id_cliente: payload.id_cliente,
      id_sucursal: payload.id_sucursal,
      id_area: payload.id_area,
    });

    // Guardamos en la base de datos
    const savedUser = await this.userRepository.save(newUser);

    // Retornar omitiendo el hash de contraseña
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }
}
