import { Inject, Injectable } from '@nestjs/common';
import { RolEnum } from '@/auth/domain/enums/rol.enum';
import { ClienteNotFoundException } from '@/clientes/domain/exceptions/cliente.exceptions';
import {
  BULK_USER_LOOKUP_PORT,
  BulkUserLookupPort,
} from '@/usuarios/domain/ports/bulk-user-lookup.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@/usuarios/domain/ports/user.repository.port';
import {
  ROL_REPOSITORY,
  RolRepositoryPort,
} from '@/usuarios/domain/ports/rol.repository.port';
import { BulkUserRow } from '@/usuarios/domain/criteria/bulk-user-row.criteria';

const MAX_NOMBRE_LENGTH = 50; // usuarios.nombre / usuarios.apellido son VarChar(50)
const MAX_CORREO_LENGTH = 255; // usuarios.correo es VarChar(255)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const OBSERVACION_SEDE_INEXISTENTE = 'Sede Inexistente';

// La carga masiva es por empresa: solo se admiten roles de cliente
// (ADMINISTRADOR y SOPORTE_* no pertenecen a una empresa; SOPORTE_INSITU además exige zonas)
export const ROLES_CARGA_MASIVA: string[] = [
  RolEnum.CLIENTE_EMPRESA,
  RolEnum.CLIENTE_SUCURSAL,
  RolEnum.CLIENTE_TRABAJADOR,
];

// Misma jerarquía que CreateUserUseCase: qué roles exigen sucursal y área
export const ROLES_QUE_EXIGEN_SUCURSAL: string[] = [
  RolEnum.CLIENTE_SUCURSAL,
  RolEnum.CLIENTE_TRABAJADOR,
];
export const ROLES_QUE_EXIGEN_AREA: string[] = [RolEnum.CLIENTE_TRABAJADOR];

// Compara textos sin importar mayúsculas, tildes ni espacios repetidos
const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

// Datos de referencia cargados una sola vez por lote (no una consulta por fila)
export interface BulkValidationContext {
  rolesPorNombre: Map<string, { id_rol: number; nombre: string }>;
  sucursalesPorNombre: Map<string, number[]>;
  areasPorSucursal: Map<number, Map<string, number>>; // id_sucursal -> (nombre normalizado -> id_area)
  correosRegistrados: Set<string>;
}

// Resultado de validar una fila, con los IDs ya resueltos para poder registrarla
export interface BulkRowValidation {
  row: BulkUserRow;
  errores: string[];
  id_rol: number | null;
  rol: string | null; // nombre canónico del rol en la BD
  id_sucursal: number | null;
  id_area: number | null;
}

@Injectable()
export class BulkUserRowValidator {
  constructor(
    @Inject(BULK_USER_LOOKUP_PORT)
    private readonly bulkUserLookup: BulkUserLookupPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
  ) {}

  // Verifica la empresa y carga en bloque todo lo necesario para validar las filas
  async buildContext(
    idCliente: number,
    rows: BulkUserRow[],
  ): Promise<BulkValidationContext> {
    if (!(await this.bulkUserLookup.existsCliente(idCliente))) {
      throw new ClienteNotFoundException();
    }

    const correos = [
      ...new Set(
        rows.map((row) => row.correo.toLowerCase()).filter((c) => c !== ''),
      ),
    ];
    const [roles, sucursales, correosExistentes] = await Promise.all([
      this.rolRepository.findAll(),
      this.bulkUserLookup.findSucursalesByCliente(idCliente),
      this.userRepository.findExistingCorreos(correos),
    ]);
    const areas = await this.bulkUserLookup.findAreasBySucursales(
      sucursales.map((s) => s.id_sucursal),
    );

    const rolesPorNombre = new Map<
      string,
      { id_rol: number; nombre: string }
    >();
    for (const rol of roles) {
      rolesPorNombre.set(rol.nombre.trim().toUpperCase(), {
        id_rol: rol.id_rol as number,
        nombre: rol.nombre,
      });
    }

    const sucursalesPorNombre = new Map<string, number[]>();
    for (const sucursal of sucursales) {
      const key = normalize(sucursal.nombre_sucursal);
      sucursalesPorNombre.set(key, [
        ...(sucursalesPorNombre.get(key) ?? []),
        sucursal.id_sucursal,
      ]);
    }

    const areasPorSucursal = new Map<number, Map<string, number>>();
    for (const area of areas) {
      const nombres = areasPorSucursal.get(area.id_sucursal) ?? new Map();
      nombres.set(normalize(area.nombre_area), area.id_area);
      areasPorSucursal.set(area.id_sucursal, nombres);
    }

    return {
      rolesPorNombre,
      sucursalesPorNombre,
      areasPorSucursal,
      correosRegistrados: new Set(correosExistentes),
    };
  }

  // Valida las filas en orden (necesario para detectar correos repetidos dentro del lote)
  validateRows(
    rows: BulkUserRow[],
    context: BulkValidationContext,
  ): BulkRowValidation[] {
    const correosEnLote = new Map<string, number>(); // correo -> primera fila donde aparece
    return rows.map((row) => this.validateRow(row, context, correosEnLote));
  }

  private validateRow(
    row: BulkUserRow,
    context: BulkValidationContext,
    correosEnLote: Map<string, number>,
  ): BulkRowValidation {
    const errores: string[] = [];
    const correo = row.correo.toLowerCase();
    const rolNormalizado = row.rol.trim().toUpperCase();

    // Datos personales
    if (!row.nombre) errores.push('Nombre obligatorio');
    else if (row.nombre.length > MAX_NOMBRE_LENGTH)
      errores.push(`Nombre excede ${MAX_NOMBRE_LENGTH} caracteres`);
    if (!row.apellido) errores.push('Apellido obligatorio');
    else if (row.apellido.length > MAX_NOMBRE_LENGTH)
      errores.push(`Apellido excede ${MAX_NOMBRE_LENGTH} caracteres`);

    // a) Correo único (en la base de datos y dentro del propio lote)
    if (!correo) {
      errores.push('Correo obligatorio');
    } else if (!EMAIL_REGEX.test(correo) || correo.length > MAX_CORREO_LENGTH) {
      errores.push('Correo con formato inválido');
    } else if (context.correosRegistrados.has(correo)) {
      errores.push('Correo ya registrado');
    } else if (correosEnLote.has(correo)) {
      errores.push(
        `Correo duplicado en el archivo (fila ${correosEnLote.get(correo)})`,
      );
    } else {
      correosEnLote.set(correo, row.fila);
    }

    // b) Rol válido y permitido en la carga masiva
    const rol = context.rolesPorNombre.get(rolNormalizado);
    if (!row.rol) errores.push('Rol obligatorio');
    else if (!rol) errores.push('Rol inexistente');
    else if (!ROLES_CARGA_MASIVA.includes(rolNormalizado))
      errores.push('Rol no permitido en la carga masiva de empresas');
    const rolValido = !!rol && ROLES_CARGA_MASIVA.includes(rolNormalizado);

    // c) Sucursal perteneciente a la empresa
    let sucursalIds: number[] | undefined;
    let sedeInexistente = false;
    if (row.sucursal) {
      sucursalIds = context.sucursalesPorNombre.get(normalize(row.sucursal));
      sedeInexistente = !sucursalIds;
      if (sedeInexistente) errores.push(OBSERVACION_SEDE_INEXISTENTE);
    } else if (
      rolValido &&
      ROLES_QUE_EXIGEN_SUCURSAL.includes(rolNormalizado)
    ) {
      errores.push(`Sucursal obligatoria para el rol ${rolNormalizado}`);
    }

    // d) Área perteneciente a la sucursal (no se evalúa si la sede es inexistente, para no duplicar ruido)
    let idSucursal: number | null = sucursalIds?.[0] ?? null;
    let idArea: number | null = null;
    if (row.area) {
      if (!row.sucursal) {
        errores.push('El área requiere indicar una sucursal');
      } else if (sucursalIds) {
        for (const id of sucursalIds) {
          const found = context.areasPorSucursal
            .get(id)
            ?.get(normalize(row.area));
          if (found !== undefined) {
            idSucursal = id;
            idArea = found;
            break;
          }
        }
        if (idArea === null) errores.push('Área no pertenece a la sucursal');
      }
    } else if (
      !sedeInexistente &&
      rolValido &&
      ROLES_QUE_EXIGEN_AREA.includes(rolNormalizado)
    ) {
      errores.push(`Área obligatoria para el rol ${rolNormalizado}`);
    }

    // Solo se asignan las relaciones que corresponden al rol (igual que CreateUserUseCase)
    if (!ROLES_QUE_EXIGEN_SUCURSAL.includes(rolNormalizado)) idSucursal = null;
    if (!ROLES_QUE_EXIGEN_AREA.includes(rolNormalizado)) idArea = null;

    return {
      row,
      errores,
      id_rol: rol?.id_rol ?? null,
      rol: rol?.nombre ?? null,
      id_sucursal: idSucursal,
      id_area: idArea,
    };
  }
}
