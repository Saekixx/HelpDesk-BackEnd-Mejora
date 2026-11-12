import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * TicketsGateway es un WebSocket Gateway que permite la comunicación en tiempo real.
 * Este gateway permite a los clientes unirse a salas específicas de tickets y recibir notificaciones
 * sobre cambios en el estado de los tickets.
 */

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'tickets',
})
export class TicketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Manejador de conexión de clientes al dashboard de tickets
  handleConnection(client: Socket) {}

  // Manejador de desconexión de clientes del dashboard de tickets
  handleDisconnect(client: Socket) {}

  // Manejador de unión a sala de tickets
  @SubscribeMessage('join_tickets_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.roomId) {
      client.join(data.roomId);
    }
  }
}
