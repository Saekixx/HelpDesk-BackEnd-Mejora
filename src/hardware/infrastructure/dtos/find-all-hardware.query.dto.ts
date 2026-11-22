import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { FilterHardwareDto } from '@/hardware/application/dtos/filter-hardware.dto';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import {
  normalizarTipoComponente,
  TipoComponente,
} from '@/hardware/domain/enums/tipo-componente.enum';

export class FindAllHardwareQueryDto implements FilterHardwareDto {
  @ApiPropertyOptional({
    description:
      'Búsqueda por número de serie, marca/modelo, nombre del tipo de componente o proveedor',
    example: 'Kingston',
  })
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar por cliente (empresa) del equipo donde está instalado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El id del cliente debe ser un número entero' })
  @Min(1, { message: 'El id del cliente debe ser mayor o igual a 1' })
  id_cliente?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por sucursal del equipo donde está instalado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El id de la sucursal debe ser un número entero' })
  @Min(1, { message: 'El id de la sucursal debe ser mayor o igual a 1' })
  id_sucursal?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por área del equipo donde está instalado',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El id del área debe ser un número entero' })
  @Min(1, { message: 'El id del área debe ser mayor o igual a 1' })
  id_area?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de componente',
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
    description: 'Filtrar por estado del hardware',
    enum: EstadoHardware,
    enumName: 'EstadoHardware',
    example: EstadoHardware.DISPONIBLE,
  })
  @IsOptional()
  @IsEnum(EstadoHardware, {
    message: `El estado debe ser uno de: ${Object.values(EstadoHardware).join(', ')}`,
  })
  estado?: EstadoHardware;

  @ApiPropertyOptional({
    description: 'Filtrar por proveedor',
    example: 'TechSupply Peru S.A.C.',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por página',
    default: 10,
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  limit?: number = 10;
}
