import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { CreateHardwareDto } from '@/hardware/application/dtos/create-hardware.dto';
import {
  normalizarTipoComponente,
  TIPO_COMPONENTE_LABEL,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';
import { UbicacionInicial } from '@/hardware/domain/enums/ubicacion-inicial.enum';

// Recorta espacios en textos; deja intacto cualquier otro tipo para que lo
// rechace el validador correspondiente.
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateHardwareRequestDto implements CreateHardwareDto {
  @ApiProperty({
    description: `Tipo de componente. Acepta la clave del enum o la etiqueta del modal: ${Object.values(TIPO_COMPONENTE_LABEL).join(', ')}`,
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.MEMORIA_RAM,
  })
  @Transform(({ value }) => normalizarTipoComponente(value))
  @IsEnum(TipoComponente, {
    message: `El tipo de componente debe ser uno de: ${Object.values(TipoComponente).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El tipo de componente es obligatorio' })
  tipo_componente: TipoComponente;

  @ApiProperty({
    description: 'Número de serie del hardware',
    example: 'SN-9876543210',
  })
  @Transform(trim)
  @IsString({ message: 'El número de serie debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de serie es obligatorio' })
  numero_serie: string;

  @ApiProperty({
    description: 'Marca y modelo del componente',
    example: 'Kingston Fury 16GB',
  })
  @Transform(trim)
  @IsString({ message: 'La marca y modelo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La marca y modelo es obligatoria' })
  marca_modelo: string;

  @ApiPropertyOptional({
    description: 'Proveedor o distribuidor del componente',
    example: 'TechSupply Peru S.A.C.',
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Fecha de compra (ISO 8601)',
    example: '2026-01-15',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de compra debe ser una fecha válida (ISO 8601)' },
  )
  fecha_compra?: string;

  @ApiPropertyOptional({
    description: 'Costo unitario (máximo 2 decimales)',
    example: 350.5,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'El costo unitario debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0, { message: 'El costo unitario no puede ser negativo' })
  costo_unitario?: number;

  @ApiPropertyOptional({
    description: 'Ruta o nombre del archivo de la factura de compra',
    example: 'facturas/fac-001.pdf',
  })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'La factura debe ser una cadena de texto' })
  url_factura?: string;

  @ApiProperty({
    description:
      'Destino inicial: ALMACEN_CENTRAL (queda disponible) o INSTALAR_EQUIPO (requiere id_equipo_destino)',
    enum: UbicacionInicial,
    enumName: 'UbicacionInicial',
    example: UbicacionInicial.ALMACEN_CENTRAL,
  })
  @IsEnum(UbicacionInicial, {
    message: `La ubicación inicial debe ser una de: ${Object.values(UbicacionInicial).join(', ')}`,
  })
  @IsNotEmpty({ message: 'La ubicación inicial es obligatoria' })
  ubicacion_inicial: UbicacionInicial;

  @ApiPropertyOptional({
    description:
      'ID del equipo donde se instalará. Obligatorio solo si ubicacion_inicial es INSTALAR_EQUIPO',
    example: 12,
    minimum: 1,
  })
  @ValidateIf(
    (o: CreateHardwareRequestDto) =>
      o.ubicacion_inicial === UbicacionInicial.INSTALAR_EQUIPO,
  )
  @IsNotEmpty({
    message: 'El equipo destino es obligatorio al instalar en un equipo',
  })
  @Type(() => Number)
  @IsInt({ message: 'El equipo destino debe ser un número entero' })
  @Min(1, { message: 'El equipo destino debe ser mayor o igual a 1' })
  id_equipo_destino?: number;
}
