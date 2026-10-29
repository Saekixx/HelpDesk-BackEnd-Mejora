import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  SucursalRepositoryPort,
  PaginatedSucursalesResult,
} from '@/clientes/domain/ports/sucursal.repository.port';
import {
  CreateSucursalResult,
  Sucursal,
  SucursalDetail,
  SucursalStats,
} from '@/clientes/domain/entities/sucursal.entity';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { GetSucursalesFilterDto } from '@/clientes/domain/dto/get-sucursales-filter.dto';
import { CreateSucursalDto } from '@/clientes/domain/dto/create-sucursal.dto';
import { UpdateSucursalDto } from '@/clientes/domain/dto/update-sucursal.dto';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import { SucursalNotFoundException } from '@/clientes/domain/exceptions/sucursal.exceptions';
import { SucursalMapper } from './mappers/sucursal.mapper';
import { Prisma } from '@prisma/client';
import { OptionDto } from '../../dtos/options.response.dto';

@Injectable()
export class SucursalPrismaRepository implements SucursalRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
  ) {}

  async findAll(
    filters: GetSucursalesFilterDto,
  ): Promise<PaginatedSucursalesResult> {
    // Desestructuramos los filtros y asignamos valores predeterminados a page y limit
    const { page = 1, limit = 10, search, is_active, id_cliente } = filters;
    // Construimos el objeto `where` para la consulta de Prisma según los filtros proporcionados
    const where: Prisma.sucursalesWhereInput = {};

    // Agregamos condiciones al objeto `where` según los filtros proporcionados
    if (id_cliente !== undefined) where.id_cliente = id_cliente;

    // Búsqueda parcial por nombre, dirección, encargado o correo.
    // En MySQL `contains` ya ignora mayúsculas según la collation (`mode` no es soportado).
    if (search) {
      where.OR = [
        { nombre_sucursal: { contains: search } },
        { direccion: { contains: search } },
        { encargado: { contains: search } },
        { correo: { contains: search } },
      ];
    }

    // Agregamos condición de estado activo si se proporciona el filtro `is_active`
    if (is_active !== undefined) where.is_active = is_active;
    // Calculamos el número de registros a omitir según la página y el límite
    const skip = (page - 1) * limit;

    // Ejecutamos la consulta de Prisma para obtener las sucursales y el total de registros que coinciden con los filtros
    const [entities, total] = await Promise.all([
      this.prisma.sucursales.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          // Incluimos información relacionada de clientes, zonas y encargado, así como el conteo de áreas asociadas a cada sucursal
          clientes: {
            select: {
              id_cliente: true,
              nombre_principal: true,
              numero_documento: true,
            },
          },
          zonas: { select: { id_zona: true, nombre_zona: true } },
          // Encargado: primer usuario vinculado a la sucursal
          usuarios: {
            select: { id_usuario: true, nombre: true, apellido: true },
            orderBy: { id_usuario: 'asc' },
            take: 1,
          },
          _count: { select: { area: true } },
        },
      }),
      // Ejecutamos la consulta de Prisma para contar el total de registros que coinciden con los filtros
      this.prisma.sucursales.count({ where }),
    ]);

    return {
      data: entities.map(SucursalMapper.toListItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Sucursal | null> {
    const entity = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: id },
    });
    if (!entity) return null;
    return SucursalMapper.toDomain(entity);
  }

  // Detalle de la sucursal con sus relaciones: áreas, cliente y encargado
  // (primer usuario vinculado). La zona se expone solo como `id_zona`.
  async findDetailById(id: number): Promise<SucursalDetail | null> {
    const entity = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: id },
      include: {
        area: {
          select: { id_area: true, nombre_area: true, is_active: true },
          orderBy: { id_area: 'asc' },
        },
        clientes: {
          select: {
            id_cliente: true,
            nombre_principal: true,
            numero_documento: true,
          },
        },
        usuarios: {
          select: { id_usuario: true, nombre: true, apellido: true },
          orderBy: { id_usuario: 'asc' },
          take: 1,
        },
      },
    });
    if (!entity) return null;
    return SucursalMapper.toDetail(entity);
  }

  // KPIs del dashboard de sucursales. Las cinco consultas son independientes,
  // por lo que se resuelven en paralelo. `areasCoberturadas` cuenta las áreas
  // vinculadas a sucursales activas.
  async getStats(): Promise<SucursalStats> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, nuevasEsteMes, principales, operativas, areas] =
      await Promise.all([
        this.prisma.sucursales.count(),
        this.prisma.sucursales.count({
          where: { created_at: { gte: inicioMes } },
        }),
        this.prisma.sucursales.count({ where: { is_principal: true } }),
        this.prisma.sucursales.count({ where: { is_active: true } }),
        this.prisma.area.count({
          where: { sucursales: { is_active: true } },
        }),
      ]);

    return {
      totalSucursales: { cantidad: total, nuevasEsteMes },
      sedesPrincipales: { cantidad: principales },
      sucursalesOperativas: { cantidad: operativas },
      areasCoberturadas: { cantidad: areas },
    };
  }

  // Creación atómica de la sucursal y de la cuenta de su encargado local. Todo
  // ocurre en una única transacción: si falla cualquier paso se revierte la
  // sucursal y el usuario.
  async create(data: CreateSucursalDto): Promise<CreateSucursalResult> {
    const { encargado } = data;
    const correoEncargado = encargado.correo_corporativo.trim().toLowerCase();

    // La contraseña inicial es aleatoria y nunca se expone: el encargado
    // establece la suya mediante el flujo de recuperación de contraseña.
    // bcrypt es costoso en CPU, por lo que se calcula antes de abrir la
    // transacción para no mantener la conexión ocupada mientras se hashea.
    const passwordHash = await this.hashService.hash(
      randomBytes(24).toString('base64url'),
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        // a) Validaciones previas
        const usuarioExistente = await tx.usuarios.findUnique({
          where: { correo: correoEncargado },
          select: { id_usuario: true },
        });
        if (usuarioExistente) {
          throw new ConflictException(
            'Ya existe un usuario registrado con ese correo',
          );
        }

        const rolEncargado = await tx.rol.findFirst({
          where: { nombre: RolEnum.CLIENTE_SUCURSAL },
          select: { id_rol: true },
        });
        if (!rolEncargado) {
          throw new InternalServerErrorException(
            `El rol ${RolEnum.CLIENTE_SUCURSAL} no está configurado en el sistema`,
          );
        }

        // b) Paso 1: sucursal. Las columnas encargado/telefono/correo son
        // NOT NULL, por lo que se rellenan con los datos del encargado.
        const sucursal = await tx.sucursales.create({
          data: {
            nombre_sucursal: data.nombre_sucursal,
            encargado: `${encargado.nombre} ${encargado.apellido}`,
            telefono: encargado.telefono_contacto ?? '',
            direccion: data.direccion,
            correo: correoEncargado,
            is_active: data.is_active ?? true,
            id_cliente: data.id_cliente,
            id_zona: data.id_zona,
          },
          select: { id_sucursal: true, nombre_sucursal: true },
        });

        // c) Paso 2: usuario encargado vinculado a la sucursal recién creada
        const usuario = await tx.usuarios.create({
          data: {
            nombre: encargado.nombre,
            apellido: encargado.apellido,
            correo: correoEncargado,
            telefono: encargado.telefono_contacto,
            password: passwordHash,
            is_active: true,
            id_rol: rolEncargado.id_rol,
            id_cliente: data.id_cliente,
            id_sucursal: sucursal.id_sucursal,
          },
          select: { id_usuario: true },
        });

        // d) Resultado
        return {
          id_sucursal: sucursal.id_sucursal,
          nombre_sucursal: sucursal.nombre_sucursal,
          usuario_encargado_id: usuario.id_usuario,
        };
      });
    } catch (error) {
      throw this.translateCreateError(error);
    }
  }

  // Traduce errores de Prisma de la creación a excepciones HTTP:
  // - P2002 (unique): dos registros concurrentes pasaron la validación de
  //   duplicados al mismo tiempo; la restricción única de la BD los detiene.
  // - P2003 (foreign key): la zona indicada no existe (el cliente ya se valida
  //   en el caso de uso).
  private translateCreateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException(
          'Ya existe un usuario registrado con ese correo',
        );
      }
      if (error.code === 'P2003') {
        return new BadRequestException('La zona seleccionada no existe');
      }
    }
    return error;
  }

  // Actualiza la sucursal y, si llega `encargado`, también la cuenta del usuario
  // vinculado. Todo ocurre en una única transacción: si falla un paso (p. ej.
  // correo duplicado) no se persiste ninguno de los dos.
  async update(id: number, data: UpdateSucursalDto): Promise<Sucursal> {
    const { encargado } = data;
    const correoEncargado = encargado?.correo_corporativo?.trim().toLowerCase();

    try {
      return await this.prisma.$transaction(async (tx) => {
        // a) Verificación de existencia
        const existente = await tx.sucursales.findUnique({
          where: { id_sucursal: id },
          select: { id_sucursal: true },
        });
        if (!existente) throw new SucursalNotFoundException();

        // b) Encargado vinculado: el mismo que muestran el listado y el
        // detalle (primer usuario de la sucursal por id_usuario ascendente).
        // Las sucursales sin usuarios vinculados solo actualizan sus columnas.
        const usuario = encargado
          ? await tx.usuarios.findFirst({
              where: { id_sucursal: id },
              orderBy: { id_usuario: 'asc' },
              select: { id_usuario: true, nombre: true, apellido: true },
            })
          : null;

        // c) El correo no puede pertenecer a otro usuario distinto al encargado
        if (correoEncargado !== undefined) {
          const duenoDelCorreo = await tx.usuarios.findUnique({
            where: { correo: correoEncargado },
            select: { id_usuario: true },
          });
          if (
            duenoDelCorreo &&
            duenoDelCorreo.id_usuario !== usuario?.id_usuario
          ) {
            throw new ConflictException(
              'Ya existe un usuario registrado con ese correo',
            );
          }
        }

        // d) Paso 1: sucursal. Las columnas encargado/telefono/correo replican
        // los datos del encargado (igual que en el alta). El texto `encargado`
        // se recompone con el nombre y apellido nuevos, completando el que no
        // llegue con el del usuario vinculado.
        const nombreCompleto = this.buildNombreEncargado(encargado, usuario);
        const updated = await tx.sucursales.update({
          where: { id_sucursal: id },
          data: {
            ...(data.nombre_sucursal !== undefined && {
              nombre_sucursal: data.nombre_sucursal,
            }),
            ...(data.direccion !== undefined && {
              direccion: data.direccion,
            }),
            ...(data.id_cliente !== undefined && {
              id_cliente: data.id_cliente,
            }),
            // number asigna la zona y null la desasigna
            ...(data.id_zona !== undefined && { id_zona: data.id_zona }),
            ...(nombreCompleto !== undefined && { encargado: nombreCompleto }),
            ...(encargado?.telefono_contacto !== undefined && {
              telefono: encargado.telefono_contacto,
            }),
            ...(correoEncargado !== undefined && { correo: correoEncargado }),
          },
        });

        // e) Paso 2: usuario encargado (solo los campos enviados)
        if (usuario && encargado) {
          const cambiosUsuario: Prisma.usuariosUpdateInput = {
            ...(encargado.nombre !== undefined && { nombre: encargado.nombre }),
            ...(encargado.apellido !== undefined && {
              apellido: encargado.apellido,
            }),
            ...(encargado.telefono_contacto !== undefined && {
              telefono: encargado.telefono_contacto,
            }),
            ...(correoEncargado !== undefined && { correo: correoEncargado }),
          };
          if (Object.keys(cambiosUsuario).length > 0) {
            await tx.usuarios.update({
              where: { id_usuario: usuario.id_usuario },
              data: cambiosUsuario,
            });
          }
        }

        return SucursalMapper.toDomain(updated);
      });
    } catch (error) {
      throw this.translateUpdateError(error);
    }
  }

  // Texto de la columna `sucursales.encargado` (nombre y apellido). Solo se
  // recalcula si llega nombre o apellido; el dato que falte se toma del usuario
  // vinculado y, si no hay usuario, solo se recalcula cuando llegan ambos.
  private buildNombreEncargado(
    encargado: UpdateSucursalDto['encargado'],
    usuario: { nombre: string; apellido: string } | null,
  ): string | undefined {
    if (encargado?.nombre === undefined && encargado?.apellido === undefined) {
      return undefined;
    }
    const nombre = encargado.nombre ?? usuario?.nombre;
    const apellido = encargado.apellido ?? usuario?.apellido;
    return nombre !== undefined && apellido !== undefined
      ? `${nombre} ${apellido}`
      : undefined;
  }

  // Traduce errores de Prisma de la actualización a excepciones HTTP:
  // - P2002 (unique): otro registro tomó el mismo correo entre la validación y
  //   la escritura; la restricción única de la BD detiene la segunda.
  // - P2003 (foreign key): la zona o el cliente indicados no existen.
  private translateUpdateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException(
          'Ya existe un usuario registrado con ese correo',
        );
      }
      if (error.code === 'P2003') {
        const campo = String(error.meta?.field_name ?? '');
        if (campo.includes('zona')) {
          return new BadRequestException('La zona seleccionada no existe');
        }
        if (campo.includes('cliente')) return new ClienteNotFoundException();
      }
    }
    return error;
  }

  async toggleStatus(id: number): Promise<Sucursal> {
    const current = await this.prisma.sucursales.findUnique({
      where: { id_sucursal: id },
    });
    if (!current) throw new SucursalNotFoundException();

    const updated = await this.prisma.sucursales.update({
      where: { id_sucursal: id },
      data: { is_active: !current.is_active },
    });
    return SucursalMapper.toDomain(updated);
  }

  async getSucursalesOptions(clienteId: number): Promise<OptionDto[]> {
    const sucursales = await this.prisma.sucursales.findMany({
      where: { id_cliente: clienteId },
      select: {
        id_sucursal: true,
        nombre_sucursal: true,
      },
    });
    return sucursales.map((s) => ({
      id: s.id_sucursal,
      nombre: s.nombre_sucursal,
    }));
  }
}
