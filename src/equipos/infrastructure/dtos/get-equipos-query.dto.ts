import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { GetEquiposFilterDto } from '@/equipos/domain/dto/get-equipos-filter.dto';
import {
  EstadoEquipo,
  normalizarEstadoEquipo,
} from '@/equipos/domain/enums/estado-equipo.enum';
import {
  AsignacionEquipo,
  normalizarAsignacionEquipo,
} from '@/equipos/domain/enums/asignacion-equipo.enum';

// La interfaz de usuario suele enviar los filtros vacíos como "", "null" o
// "undefined" (ej. `?id_cliente=&estado=`); se tratan como filtro omitido.
// Se lee el valor crudo (`obj[key]`) porque `enableImplicitConversion` ya
// convirtió el valor (ej. "" -> 0) antes de ejecutar el @Transform.
const vacioAUndefined = (valor: unknown): unknown => {
  if (valor === null) return undefined;
  if (typeof valor !== 'string') return valor;
  const texto = valor.trim();
  return ['', 'null', 'undefined'].includes(texto.toLowerCase())
    ? undefined
    : texto;
};

type TransformParams = { obj: Record<string, unknown>; key: string };

// Entero opcional: vacío -> undefined; no numérico -> NaN (lo rechaza @IsInt).
const aEnteroOpcional = ({ obj, key }: TransformParams): unknown => {
  const valor = vacioAUndefined(obj[key]);
  return valor === undefined ? undefined : Number(valor);
};

export class GetEquiposQueryDto implements GetEquiposFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por cliente (empresa) dueño del equipo',
    example: 1,
  })
  @IsOptional()
  @Transform(aEnteroOpcional)
  @IsInt({ message: 'id_cliente debe ser un número entero' })
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por sucursal donde está asignado el equipo',
    example: 1,
  })
  @IsOptional()
  @Transform(aEnteroOpcional)
  @IsInt({ message: 'id_sucursal debe ser un número entero' })
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por área donde está ubicado el equipo',
    example: 1,
  })
  @IsOptional()
  @Transform(aEnteroOpcional)
  @IsInt({ message: 'id_area debe ser un número entero' })
  id_area?: number;

  @ApiPropertyOptional({
    description:
      'Término de búsqueda por nombre del equipo, número de serie, marca/modelo o trabajador',
    example: 'Dell',
  })
  @IsOptional()
  @Transform(({ obj, key }: TransformParams) => vacioAUndefined(obj[key]))
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar por estado del equipo (acepta la clave o la etiqueta, ej. "En_Almacen" o "En Almacén")',
    enum: EstadoEquipo,
    enumName: 'EstadoEquipo',
    example: EstadoEquipo.ACTIVO,
  })
  @IsOptional()
  @Transform(({ obj, key }: TransformParams) =>
    normalizarEstadoEquipo(vacioAUndefined(obj[key])),
  )
  @IsEnum(EstadoEquipo, {
    message: `El estado debe ser uno de: ${Object.values(EstadoEquipo).join(', ')}`,
  })
  estado?: EstadoEquipo;

  @ApiPropertyOptional({
    description:
      'Filtrar por asignación: "Asignados" (con trabajador) o "Sin Asignar" (sin trabajador). Si se omite, retorna ambos.',
    enum: AsignacionEquipo,
    enumName: 'AsignacionEquipo',
    example: AsignacionEquipo.ASIGNADOS,
  })
  @IsOptional()
  @Transform(({ obj, key }: TransformParams) =>
    normalizarAsignacionEquipo(vacioAUndefined(obj[key])),
  )
  @IsEnum(AsignacionEquipo, {
    message: `La asignación debe ser una de: ${Object.values(AsignacionEquipo).join(', ')}`,
  })
  asignacion?: AsignacionEquipo;

  @ApiPropertyOptional({
    description: 'Número de página para la paginación',
    default: 1,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform((params: TransformParams) => aEnteroOpcional(params) ?? 1)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    default: 10,
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Transform((params: TransformParams) => aEnteroOpcional(params) ?? 10)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
