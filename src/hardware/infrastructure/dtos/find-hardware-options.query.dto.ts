import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { GetHardwareOptionsQueryDto } from '@/hardware/application/dtos/get-hardware-options.query.dto';
import {
  EstadoHardware,
  normalizarEstadoHardware,
} from '@/hardware/domain/enums/estado-hardware.enum';
import {
  normalizarTipoComponente,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';

export class FindHardwareOptionsQueryDto implements GetHardwareOptionsQueryDto {
  @ApiPropertyOptional({
    description:
      'Filtrar por estado del hardware (acepta la clave o la etiqueta, ej. "DISPONIBLE" o "Disponible")',
    enum: EstadoHardware,
    enumName: 'EstadoHardware',
    example: EstadoHardware.DISPONIBLE,
  })
  @IsOptional()
  @Transform(({ value }) => normalizarEstadoHardware(value))
  @IsEnum(EstadoHardware, {
    message: `El estado debe ser uno de: ${Object.values(EstadoHardware).join(', ')}`,
  })
  estado?: EstadoHardware;

  @ApiPropertyOptional({
    description:
      'Filtrar por tipo de componente (acepta la clave o la etiqueta, ej. "MEMORIA_RAM" o "Memoria RAM")',
    enum: TipoComponente,
    enumName: 'TipoComponente',
    example: TipoComponente.MEMORIA_RAM,
  })
  @IsOptional()
  @Transform(({ value }) => normalizarTipoComponente(value))
  @IsEnum(TipoComponente, {
    message: `El tipo de componente debe ser uno de: ${Object.values(TipoComponente).join(', ')}`,
  })
  tipo_componente?: TipoComponente;

  @ApiPropertyOptional({
    description: 'Filtrar por el equipo donde está instalado actualmente',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El id del equipo debe ser un número entero' })
  @Min(1, { message: 'El id del equipo debe ser mayor o igual a 1' })
  id_equipo_actual?: number;
}
