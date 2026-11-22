import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { TransitionHardwareDto } from '@/hardware/application/dtos/transition-hardware.dto';
import {
  ESTADO_HARDWARE_LABEL,
  EstadoHardware,
  normalizarEstadoHardware,
} from '@/hardware/domain/enums/estado-hardware.enum';

// Recorta espacios en textos; deja intacto cualquier otro tipo para que lo
// rechace el validador correspondiente.
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Longitud máxima de la observación. La columna que la guarda
// (registro_hardware.motivo_retiro) es TEXT, así que este tope es de negocio.
const MOTIVO_MAX_LENGTH = 500;

// Body de PATCH /hardware/:id/transition.
export class TransitionHardwareRequestDto implements TransitionHardwareDto {
  @ApiProperty({
    description: `Estado al que pasa el hardware. Acepta la clave del enum o la etiqueta: ${Object.values(ESTADO_HARDWARE_LABEL).join(', ')}`,
    enum: EstadoHardware,
    enumName: 'EstadoHardware',
    example: EstadoHardware.INSTALADO,
  })
  @Transform(({ value }) => normalizarEstadoHardware(value))
  @IsEnum(EstadoHardware, {
    message: `El estado debe ser uno de: ${Object.values(EstadoHardware).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  estado: EstadoHardware;

  // Opcional salvo al instalar. No lleva @IsOptional() porque este decorador
  // anularía la obligatoriedad condicional: con INSTALADO se exige y con
  // cualquier otro estado ni se valida ni se usa (mismo criterio que
  // `id_equipo_destino` al registrar un hardware).
  @ApiPropertyOptional({
    description:
      'ID del equipo donde se instalará. Obligatorio solo si estado es INSTALADO; con otros estados se ignora',
    example: 12,
    minimum: 1,
  })
  @ValidateIf(
    (o: TransitionHardwareRequestDto) => o.estado === EstadoHardware.INSTALADO,
  )
  @IsNotEmpty({ message: 'El equipo es obligatorio al instalar el hardware' })
  @Type(() => Number)
  @IsInt({ message: 'El equipo debe ser un número entero' })
  @Min(1, { message: 'El equipo debe ser mayor o igual a 1' })
  id_equipo?: number;

  @ApiProperty({
    description:
      'Motivo u observación de la intervención. Queda registrado para la trazabilidad del componente',
    example: 'Reemplazo de RAM por falla detectada en pruebas de memoria',
    maxLength: MOTIVO_MAX_LENGTH,
  })
  @Transform(trim)
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  @MaxLength(MOTIVO_MAX_LENGTH, {
    message: `El motivo no puede superar los ${MOTIVO_MAX_LENGTH} caracteres`,
  })
  motivo: string;
}
