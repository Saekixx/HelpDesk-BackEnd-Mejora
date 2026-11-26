import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { GetEquipoOptionsFilterDto } from '@/equipos/domain/dto/get-equipo-options-filter.dto';
import {
  EstadoEquipo,
  normalizarEstadoEquipo,
} from '@/equipos/domain/enums/estado-equipo.enum';
import {
  aEnteroOpcional,
  TransformParams,
  vacioAUndefined,
} from './query-params.helpers';

// Query params de GET /equipos/options. Todos son opcionales y se pueden
// combinar (filtros en cascada). Los valores vacíos ("", "null", "undefined")
// se ignoran.
export class GetEquipoOptionsQueryDto implements GetEquipoOptionsFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por cliente (empresa) dueño del equipo',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(aEnteroOpcional)
  @IsInt({ message: 'id_cliente debe ser un número entero' })
  @Min(1, {
    message: 'id_cliente debe ser un entero positivo (mayor o igual a 1)',
  })
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por sucursal donde está asignado el equipo',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(aEnteroOpcional)
  @IsInt({ message: 'id_sucursal debe ser un número entero' })
  @Min(1, {
    message: 'id_sucursal debe ser un entero positivo (mayor o igual a 1)',
  })
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por área donde está ubicado el equipo',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(aEnteroOpcional)
  @IsInt({ message: 'id_area debe ser un número entero' })
  @Min(1, {
    message: 'id_area debe ser un entero positivo (mayor o igual a 1)',
  })
  id_area?: number;

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
      'Búsqueda parcial por nombre del equipo, número de serie o marca/modelo',
    example: 'Dell',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(({ obj, key }: TransformParams) => vacioAUndefined(obj[key]))
  @IsString({ message: 'La búsqueda debe ser una cadena de texto' })
  @MaxLength(150, {
    message: 'La búsqueda no puede superar los 150 caracteres',
  })
  search?: string;
}
