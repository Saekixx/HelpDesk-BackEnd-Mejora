import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateEquipoDto } from '@/equipos/domain/dto/create-equipo.dto';

type TransformParams = {
  value: unknown;
  obj: Record<string, unknown>;
  key: string;
};

// Texto sin espacios al inicio ni al final (otros tipos pasan sin cambios).
const recortar = ({ value }: TransformParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

// Entero requerido: "7" o 7 -> 7; vacío o null -> undefined (lo rechaza
// @IsNotEmpty); texto no numérico -> NaN (lo rechaza @IsInt). Se lee el valor
// crudo (`obj[key]`) porque `enableImplicitConversion` ya convirtió "" en 0.
const aEntero = ({ obj, key }: TransformParams): unknown => {
  const crudo = obj[key];
  if (typeof crudo === 'number') return crudo;
  if (typeof crudo === 'string' && crudo.trim() !== '') {
    return Number(crudo.trim());
  }
  return undefined;
};

// Entero opcional: vacío, "null" o null -> null (sin trabajador); ausente ->
// undefined; cualquier otro valor se convierte y se valida como entero.
const aEnteroONulo = ({ obj, key }: TransformParams): unknown => {
  const crudo = obj[key];
  if (crudo === undefined) return undefined;
  if (crudo === null) return null;
  if (typeof crudo === 'string') {
    const texto = crudo.trim();
    return ['', 'null', 'undefined'].includes(texto.toLowerCase())
      ? null
      : Number(texto);
  }
  return crudo;
};

export class CreateEquipoHttpDto implements CreateEquipoDto {
  @ApiProperty({
    description: 'TAG o nombre identificador del activo',
    example: 'PC-DELL-90',
    maxLength: 100,
  })
  @Transform(recortar)
  @IsString({ message: 'El nombre del equipo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del equipo es obligatorio' })
  @MaxLength(100, {
    message: 'El nombre del equipo no puede exceder los 100 caracteres',
  })
  readonly nombre_equipo: string;

  @ApiProperty({
    description: 'Número de serie del equipo (único)',
    example: 'SN-2026-00123',
    maxLength: 100,
  })
  @Transform(recortar)
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de serie es obligatorio' })
  @MaxLength(100, {
    message: 'El número de serie no puede exceder los 100 caracteres',
  })
  readonly num_serie: string;

  @ApiProperty({
    description: 'Tipo de equipo',
    example: 'Laptop',
    maxLength: 50,
  })
  @Transform(recortar)
  @IsString({ message: 'El tipo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @MaxLength(50, { message: 'El tipo no puede exceder los 50 caracteres' })
  readonly tipo: string;

  @ApiProperty({
    description: 'Marca y modelo del equipo',
    example: 'Dell Latitude 5540',
    maxLength: 150,
  })
  @Transform(recortar)
  @IsString({ message: 'La marca y modelo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca y modelo es obligatoria' })
  @MaxLength(150, {
    message: 'La marca y modelo no puede exceder los 150 caracteres',
  })
  readonly marca_modelo: string;

  @ApiProperty({
    description: 'ID del cliente (empresa) dueño del equipo',
    example: 1,
    minimum: 1,
  })
  @Transform(aEntero)
  @IsNotEmpty({ message: 'El cliente es obligatorio' })
  @IsInt({ message: 'El ID de cliente debe ser un número entero' })
  @IsPositive({ message: 'El ID de cliente debe ser un número positivo' })
  readonly id_cliente: number;

  @ApiProperty({
    description: 'ID de la sucursal donde está asignado el equipo',
    example: 1,
    minimum: 1,
  })
  @Transform(aEntero)
  @IsNotEmpty({ message: 'La sucursal es obligatoria' })
  @IsInt({ message: 'El ID de sucursal debe ser un número entero' })
  @IsPositive({ message: 'El ID de sucursal debe ser un número positivo' })
  readonly id_sucursal: number;

  @ApiProperty({
    description: 'ID del área donde está ubicado el equipo',
    example: 1,
    minimum: 1,
  })
  @Transform(aEntero)
  @IsNotEmpty({ message: 'El área es obligatoria' })
  @IsInt({ message: 'El ID de área debe ser un número entero' })
  @IsPositive({ message: 'El ID de área debe ser un número positivo' })
  readonly id_area: number;

  @ApiPropertyOptional({
    description:
      'ID del trabajador (usuario) asignado al equipo. Si se omite o es null, el equipo queda sin asignar.',
    example: 5,
    minimum: 1,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @Transform(aEnteroONulo)
  @IsInt({ message: 'El ID de trabajador debe ser un número entero' })
  @IsPositive({ message: 'El ID de trabajador debe ser un número positivo' })
  readonly id_trabajador?: number | null;
}
