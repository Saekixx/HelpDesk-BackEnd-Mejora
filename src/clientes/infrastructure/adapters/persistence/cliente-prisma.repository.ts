import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';
import {
  ClienteRepositoryPort,
  PaginatedClientesResult,
} from '@/clientes/domain/ports/cliente.repository.port';
import {
  Cliente,
  ClienteDetail,
  ClienteDetailView,
  CreateClienteCommand,
  CreateClienteResult,
  UpdateClienteCommand,
  UpdateClienteResult,
} from '@/clientes/domain/entities/cliente.entity';
import {
  HASH_SERVICE,
  HashServicePort,
} from '@/auth/domain/ports/hash.service.port';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { GetClientesFilterDto } from '@/clientes/domain/dto/get-clientes-filter.dto';
import { ClienteStatsResult } from '@/clientes/domain/dto/cliente-stats.dto';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import {
  ClienteMapper,
  CLIENTE_LIST_SELECT,
  CLIENTE_DETAIL_SELECT,
} from './mappers/cliente.mapper';
import { Prisma, clientes_tipo_cliente } from '@prisma/client';
import { OptionDto } from '../../dtos/options.response.dto';

const PLAN_ENTERPRISE_KEYWORD = 'Enterprise';

// Contraseña inicial del usuario responsable creado al registrar un cliente.
// Se guarda siempre encriptada (bcrypt vía HASH_SERVICE).
const PASSWORD_POR_DEFECTO_RESPONSABLE = 'Cliente2026!';

@Injectable()
export class ClientePrismaRepository implements ClienteRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(HASH_SERVICE)
    private readonly hashService: HashServicePort,
  ) {}

  async findAll(
    filter: GetClientesFilterDto,
  ): Promise<PaginatedClientesResult> {
    const { page = 1, limit = 10 } = filter;

    const where = this.buildWhere(filter);

    const skip = (page - 1) * limit;

    const [entities, total] = await Promise.all([
      this.prisma.clientes.findMany({
        where,
        skip,
        take: limit,
        // id_cliente como desempate para que la paginación sea estable
        orderBy: [{ created_at: 'desc' }, { id_cliente: 'desc' }],
        select: CLIENTE_LIST_SELECT,
      }),
      this.prisma.clientes.count({ where }),
    ]);

    return {
      data: entities.map(ClienteMapper.toListItem),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Construye el criterio de filtrado del listado a partir de los query params.
  // - search: coincidencia parcial (contains) en nombre/razón social
  //   (`nombre_principal`), número de documento y correo.
  // - tipo_cliente: enum JURIDICA | NATURAL.
  // - estado: "activo" | "inactivo", se mapea a la columna `is_active`.
  private buildWhere(filter: GetClientesFilterDto): Prisma.clientesWhereInput {
    const { search, tipo_cliente, estado } = filter;
    const where: Prisma.clientesWhereInput = {};

    const term = search?.trim();
    if (term) {
      where.OR = [
        { nombre_principal: { contains: term } },
        { numero_documento: { contains: term } },
        { correo: { contains: term } },
      ];
    }

    if (tipo_cliente !== undefined) {
      where.tipo_cliente = tipo_cliente as unknown as clientes_tipo_cliente;
    }

    if (estado !== undefined) {
      where.is_active = estado === 'activo';
    }

    return where;
  }

  async findById(id: number): Promise<ClienteDetail | null> {
    const entity = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
      include: { planes: true, sucursales: true },
    });
    if (!entity) return null;
    return ClienteMapper.toDetail(entity);
  }

  // Detalle de un cliente específico (GET /clientes/:id).
  async findDetailById(id: number): Promise<ClienteDetailView | null> {
    const entity = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
      select: CLIENTE_DETAIL_SELECT,
    });
    if (!entity) return null;
    return ClienteMapper.toDetailView(entity);
  }

  // KPIs del módulo de clientes. Las cinco consultas son independientes, por
  // lo que se resuelven en paralelo.
  async getStats(): Promise<ClienteStatsResult> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, nuevosEsteMes, juridicos, naturales, enterprise] =
      await Promise.all([
        this.prisma.clientes.count(),
        this.prisma.clientes.count({
          where: { created_at: { gte: inicioMes } },
        }),
        this.prisma.clientes.count({
          where: { tipo_cliente: clientes_tipo_cliente.JURIDICA },
        }),
        this.prisma.clientes.count({
          where: { tipo_cliente: clientes_tipo_cliente.NATURAL },
        }),
        this.prisma.clientes.count({
          where: {
            is_active: true,
            planes: { tipo: { contains: PLAN_ENTERPRISE_KEYWORD } },
          },
        }),
      ]);

    return {
      totalClientes: { cantidad: total, nuevosEsteMes },
      clientesJuridicos: { cantidad: juridicos },
      clientesNaturales: { cantidad: naturales },
      planesEnterprise: { cantidad: enterprise },
    };
  }

  async existsByDocumento(numero_documento: string): Promise<boolean> {
    const count = await this.prisma.clientes.count({
      where: { numero_documento },
    });
    return count > 0;
  }

  // Registro de un cliente en 3 pasos. Todo ocurre en una única transacción:
  // si falla cualquier inserción se revierte el cliente, el usuario responsable
  // y la sucursal matriz.
  async create(command: CreateClienteCommand): Promise<CreateClienteResult> {
    const { datos_empresa, responsable, sucursal_principal } = command;

    const numeroDocumento = datos_empresa.numero_documento.trim();
    const correoResponsable = responsable.correo.trim().toLowerCase();

    // bcrypt es costoso en CPU: se calcula antes de abrir la transacción para
    // no mantener la conexión de base de datos ocupada mientras se hashea.
    const passwordHash = await this.hashService.hash(
      PASSWORD_POR_DEFECTO_RESPONSABLE,
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        // a) Validación de duplicados
        const clienteExistente = await tx.clientes.findUnique({
          where: { numero_documento: numeroDocumento },
          select: { id_cliente: true },
        });
        if (clienteExistente) {
          throw new ConflictException(
            'Ya existe un cliente registrado con ese número de documento',
          );
        }

        const usuarioExistente = await tx.usuarios.findUnique({
          where: { correo: correoResponsable },
          select: { id_usuario: true },
        });
        if (usuarioExistente) {
          throw new ConflictException(
            'Ya existe un usuario registrado con ese correo',
          );
        }

        const rolResponsable = await tx.rol.findFirst({
          where: { nombre: RolEnum.CLIENTE_EMPRESA },
          select: { id_rol: true },
        });
        if (!rolResponsable) {
          throw new InternalServerErrorException(
            `El rol ${RolEnum.CLIENTE_EMPRESA} no está configurado en el sistema`,
          );
        }

        // b) Cliente
        const cliente = await tx.clientes.create({
          data: {
            nombre_principal: datos_empresa.nombre_principal,
            numero_documento: numeroDocumento,
            tipo_cliente:
              datos_empresa.tipo_cliente as unknown as clientes_tipo_cliente,
            rubro: datos_empresa.rubro,
            direccion: datos_empresa.direccion,
            // El contacto de la empresa es el del responsable: se guarda el
            // mismo correo (normalizado) y teléfono que recibe el usuario.
            telefono: responsable.telefono,
            correo: correoResponsable,
            id_plan: datos_empresa.id_plan,
          },
          select: {
            id_cliente: true,
            nombre_principal: true,
            numero_documento: true,
          },
        });

        // c) Usuario responsable (hereda correo y teléfono del responsable)
        const usuario = await tx.usuarios.create({
          data: {
            nombre: responsable.nombre,
            apellido: responsable.apellido,
            correo: correoResponsable,
            password: passwordHash,
            telefono: responsable.telefono,
            is_active: true,
            id_rol: rolResponsable.id_rol,
            id_cliente: cliente.id_cliente,
          },
          select: { id_usuario: true },
        });

        // d) Sucursal matriz. El comando no trae teléfono ni correo propios,
        // por lo que se heredan del responsable.
        const sucursal = await tx.sucursales.create({
          data: {
            nombre_sucursal: sucursal_principal.nombre_sucursal,
            encargado:
              sucursal_principal.encargado?.trim() ||
              `${responsable.nombre} ${responsable.apellido}`,
            telefono: responsable.telefono,
            correo: correoResponsable,
            direccion:
              sucursal_principal.direccion ?? datos_empresa.direccion ?? '',
            id_cliente: cliente.id_cliente,
            is_principal: true,
            is_active: true,
          },
          select: { id_sucursal: true },
        });

        // e) Resultado
        return {
          id_cliente: cliente.id_cliente,
          nombre_principal: cliente.nombre_principal,
          ruc: cliente.numero_documento ?? numeroDocumento,
          sucursal_principal_id: sucursal.id_sucursal,
          usuario_responsable_id: usuario.id_usuario,
        };
      });
    } catch (error) {
      throw this.translateCreateError(error);
    }
  }

  // Traduce errores de Prisma del registro a excepciones HTTP:
  // - P2002 (unique): dos registros concurrentes pasaron la validación de
  //   duplicados al mismo tiempo; la restricción única de la BD los detiene.
  // - P2003 (foreign key): el único dato externo con FK es `id_plan`.
  private translateCreateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = String(error.meta?.target ?? '');
        return target.includes('correo')
          ? new ConflictException(
              'Ya existe un usuario registrado con ese correo',
            )
          : new ConflictException(
              'Ya existe un cliente registrado con ese número de documento',
            );
      }
      if (error.code === 'P2003') {
        return new BadRequestException('El plan seleccionado no existe');
      }
    }
    return error;
  }

  // Actualización parcial de un cliente (PATCH /clientes/:id). Las
  // validaciones y la escritura ocurren en una única transacción para que la
  // comprobación de duplicados y el update vean el mismo estado.
  async update(
    id: number,
    command: UpdateClienteCommand,
  ): Promise<UpdateClienteResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // a) Verificación de existencia
        const actual = await tx.clientes.findUnique({
          where: { id_cliente: id },
          select: { id_cliente: true, numero_documento: true },
        });
        if (!actual) {
          throw new NotFoundException('El cliente solicitado no existe');
        }

        // b) Validación de duplicados: solo si el documento cambia
        if (
          command.numero_documento !== undefined &&
          command.numero_documento !== actual.numero_documento
        ) {
          const duplicado = await tx.clientes.findUnique({
            where: { numero_documento: command.numero_documento },
            select: { id_cliente: true },
          });
          if (duplicado && duplicado.id_cliente !== id) {
            throw new ConflictException(
              'El número de documento ya está registrado por otra empresa',
            );
          }
        }

        // c) Validación del plan
        if (command.id_plan !== undefined) {
          const plan = await tx.planes.findUnique({
            where: { id_plan: command.id_plan },
            select: { id_plan: true },
          });
          if (!plan) {
            throw new BadRequestException('El plan seleccionado no existe');
          }
        }

        // d) Actualización: solo los campos definidos en el comando
        const data: Prisma.clientesUncheckedUpdateInput = {
          updated_at: new Date(),
        };
        if (command.nombre_principal !== undefined) {
          data.nombre_principal = command.nombre_principal;
        }
        if (command.numero_documento !== undefined) {
          data.numero_documento = command.numero_documento;
        }
        if (command.rubro !== undefined) data.rubro = command.rubro;
        if (command.id_plan !== undefined) data.id_plan = command.id_plan;

        const actualizado = await tx.clientes.update({
          where: { id_cliente: id },
          data,
          select: {
            id_cliente: true,
            nombre_principal: true,
            numero_documento: true,
            rubro: true,
            id_plan: true,
          },
        });

        // e) Resultado
        return {
          id_cliente: actualizado.id_cliente,
          nombre_principal: actualizado.nombre_principal,
          // La columna es nullable en BD, pero un cliente registrado siempre
          // tiene documento.
          numero_documento: actualizado.numero_documento ?? '',
          rubro: actualizado.rubro,
          id_plan: actualizado.id_plan,
        };
      });
    } catch (error) {
      throw this.translateUpdateError(error);
    }
  }

  // Traduce errores de Prisma de la actualización a excepciones HTTP:
  // - P2002 (unique): otro cliente tomó el documento entre la validación y el
  //   update (condición de carrera).
  // - P2003 (foreign key): el plan fue eliminado entre la validación y el update.
  // - P2025 (record not found): el cliente fue eliminado entre ambos pasos.
  private translateUpdateError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return new ConflictException(
          'El número de documento ya está registrado por otra empresa',
        );
      }
      if (error.code === 'P2003') {
        return new BadRequestException('El plan seleccionado no existe');
      }
      if (error.code === 'P2025') {
        return new NotFoundException('El cliente solicitado no existe');
      }
    }
    return error;
  }

  async toggleStatus(id: number): Promise<Cliente> {
    const current = await this.prisma.clientes.findUnique({
      where: { id_cliente: id },
    });
    if (!current) throw new ClienteNotFoundException();

    const updated = await this.prisma.clientes.update({
      where: { id_cliente: id },
      data: { is_active: !current.is_active },
    });
    return ClienteMapper.toDomain(updated);
  }

  async getClientesOptions(): Promise<OptionDto[]> {
    const clientes = await this.prisma.clientes.findMany({
      select: {
        id_cliente: true,
        nombre_principal: true,
      },
    });
    return clientes.map((c) => ({
      id: c.id_cliente,
      nombre: c.nombre_principal,
    }));
  }
}
