import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CitaEstado } from '../../domain/entity/cita-soporte.entity';

export class TecnicoCitaDetalleDto {
  @ApiProperty({ example: 3 })
  id_tecnico: number;

  @ApiProperty({ example: 'Luis' })
  nombre: string;

  @ApiProperty({ example: 'Torres' })
  apellido: string;
}

export class ClienteCitaDetalleDto {
  @ApiProperty({ example: 1 })
  id_cliente: number;

  @ApiProperty({ example: 'Innovación Global Tech' })
  nombre_principal: string;

  @ApiProperty({ example: '20555666777' })
  numero_documento: string;
}

export class SucursalCitaDetalleDto {
  @ApiProperty({ example: 1 })
  id_sucursal: number;

  @ApiProperty({ example: 'Sede Central' })
  nombre_sucursal: string;

  @ApiProperty({ example: 'Av. Principal 123' })
  direccion: string;

  @ApiPropertyOptional({ type: Number, nullable: true, example: -12.096412 })
  latitud: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true, example: -77.035421 })
  longitud: number | null;
}

export class AreaCitaDetalleDto {
  @ApiProperty({ example: 1 })
  id_area: number;

  @ApiProperty({ example: 'Sistemas y TI' })
  nombre_area: string;
}

export class TrabajadorCitaDetalleDto {
  @ApiProperty({ example: 6 })
  id_trabajador: number;

  @ApiProperty({ example: 'Jorge' })
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  apellido: string;
}

export class EquipoCitaDetalleDto {
  @ApiProperty({ example: 1 })
  id_equipo: number;

  @ApiProperty({ example: 'Desktop' })
  tipo: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    nullable: true,
    example: '2026-01-15',
  })
  ultima_revision: Date | null;
}

export class CitaSoporteDetalleDto {
  @ApiProperty({ example: 1 })
  id_cita: number;

  @ApiProperty({
    enum: ['Pendiente', 'En_Camino', 'Completada', 'Cancelada', 'Reprogramada'],
    example: 'Pendiente',
  })
  estado: CitaEstado;

  @ApiProperty({ type: String, format: 'date', example: '2026-10-15' })
  fecha_programada: Date;

  @ApiProperty({ type: String, example: '1970-01-01T09:00:00.000Z' })
  hora_inicio: Date;

  @ApiProperty({ type: String, example: '1970-01-01T11:00:00.000Z' })
  hora_fin: Date;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'Revisión técnica in-situ por problema de encendido eléctrico',
  })
  observaciones: string | null;

  @ApiProperty({ type: TecnicoCitaDetalleDto })
  tecnico: TecnicoCitaDetalleDto;

  @ApiProperty({ type: ClienteCitaDetalleDto })
  cliente: ClienteCitaDetalleDto;

  @ApiProperty({ type: SucursalCitaDetalleDto })
  sucursal: SucursalCitaDetalleDto;

  @ApiProperty({ type: AreaCitaDetalleDto })
  area: AreaCitaDetalleDto;

  @ApiProperty({ type: TrabajadorCitaDetalleDto })
  trabajador: TrabajadorCitaDetalleDto;

  @ApiProperty({ type: EquipoCitaDetalleDto })
  equipo: EquipoCitaDetalleDto;
}
