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
import { Inject } from '@nestjs/common';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { GetHistoryUseCase } from '../../application/use-cases/get-history.use-case';
import { SendMessageDto } from '../../application/dtos/send-message.dto';
import { ICachePort } from '../../domain/ports/cache.port';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase,
    @Inject(ICachePort)
    private readonly cachePort: ICachePort,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await this.cachePort.setUserOnline(userId, client.id);
      console.log(`Cliente conectado: ${client.id} (User: ${userId})`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await this.cachePort.setUserOffline(userId);
      console.log(`Cliente desconectado: ${client.id}`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = typeof data === 'string' ? data : data?.roomId;

    if (!roomId) {
      console.error('Error: roomId no provisto en join_room', data);
      return;
    }

    await client.join(roomId);
    console.log(`Socket ${client.id} se unió a la sala: ${roomId}`);

    const history = await this.getHistoryUseCase.execute(roomId);
    client.emit('chat_history', history);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() rawDto: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const dto = typeof rawDto === 'string' ? JSON.parse(rawDto) : rawDto;

      const targetRoom = dto?.roomId;
      const sender = dto?.senderId;
      const messageContent = dto?.content;

      if (!targetRoom || !sender || !messageContent) {
        console.error('Payload inválido en send_message:', dto);
        return;
      }

      // El caso de uso lanzará una excepción si el usuario no es el creador o el soporte asignado
      const savedMessage: any = await this.sendMessageUseCase.execute({
        roomId: targetRoom,
        senderId: sender,
        content: messageContent,
      });

      const payload = {
        id: savedMessage?.id || savedMessage?._id || Date.now().toString(),
        roomId: savedMessage?.roomId || targetRoom,
        senderId: savedMessage?.senderId || sender,
        content: savedMessage?.content || messageContent,
        createdAt: savedMessage?.createdAt || new Date(),
      };

      // Se emite el mensaje a los integrantes conectados a la sala
      this.server.to(targetRoom).emit('receive_message', payload);
    } catch (error: any) {
      // Enviar una notificación de error únicamente al cliente emisor
      client.emit('chat_error', {
        message: error.message || 'No se pudo enviar el mensaje.',
      });
      console.error('Error al procesar send_message:', error.message);
    }
  }
}
