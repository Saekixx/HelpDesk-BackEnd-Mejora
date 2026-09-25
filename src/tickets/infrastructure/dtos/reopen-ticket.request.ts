import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { RolUsuario } from '../../domain/entities/ticket.entity';

export class ReopenTicketCommand {
  @ApiProperty({
    description: 'ID del ticket que se desea reabrir',
    example: 104,
  })
  @IsInt()
  @IsNotEmpty()
  id_ticket: number;

  @ApiProperty({
    description: 'ID del usuario que solicita reabrir el ticket',
    example: 12,
  })
  @IsInt()
  @IsNotEmpty()
  usuario_id: number;

  @ApiProperty({
    description: 'Rol del usuario que ejecuta la reapertura',
    enum: RolUsuario,
    example: RolUsuario.CLIENTE_TRABAJADOR,
  })
  @IsString()
  @IsNotEmpty()
  rol_usuario: string;
}
