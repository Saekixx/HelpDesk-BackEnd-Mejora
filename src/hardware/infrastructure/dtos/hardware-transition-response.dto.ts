import { ApiProperty } from '@nestjs/swagger';
import { EstadoHardware } from '@/hardware/domain/enums/estado-hardware.enum';
import { HardwareEquipoActualResponseDto } from './hardware-response.dto';

// Hardware tras cambiar de estado (PATCH /hardware/:id/transition)
export class HardwareTransitionResponseDto {
  @ApiProperty({ description: 'ID del hardware', example: 7 })
  id_hardware: number;

  @ApiProperty({ description: 'Número de serie', example: 'SN-9876543210' })
  numero_serie: string;

  @ApiProperty({ description: 'Marca y modelo', example: 'Kingston Fury 16GB' })
  marca_modelo: string;

  @ApiProperty({
    description: 'Nuevo estado oficial del hardware (clave)',
    enum: EstadoHardware,
    enumName: 'EstadoHardware',
    example: EstadoHardware.INSTALADO,
  })
  estado: EstadoHardware;

  @ApiProperty({ description: 'Estado legible', example: 'Instalado' })
  estado_label: string;

  @ApiProperty({
    description:
      'Equipo donde queda instalado y su ubicación (cliente, sucursal, área). null cuando el hardware pasa a DISPONIBLE, EN_MANTENIMIENTO o BAJA, porque deja de estar asignado a un equipo.',
    type: HardwareEquipoActualResponseDto,
    nullable: true,
  })
  equipo_actual: HardwareEquipoActualResponseDto | null;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-10-30T15:45:00.000Z',
  })
  updated_at: Date;
}
