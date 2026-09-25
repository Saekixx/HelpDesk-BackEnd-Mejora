import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { RolUsuario } from '../../domain/entities/ticket.entity';

export class CloseTicketCommand {
  @ApiProperty({
    description: 'ID del ticket que se va a cerrar',
    example: 104,
  })
  @IsInt()
  @IsNotEmpty()
  id_ticket: number;

  @ApiProperty({
    description: 'ID del usuario que solicita el cierre',
    example: 12,
  })
  @IsInt()
  @IsNotEmpty()
  usuario_id: number;

  @ApiProperty({
    description: 'Rol del usuario que ejecuta la acción',
    enum: RolUsuario,
    example: RolUsuario.SOPORTE_TECNICO,
  })
  @IsString()
  @IsNotEmpty()
  rol_usuario: string;
}
