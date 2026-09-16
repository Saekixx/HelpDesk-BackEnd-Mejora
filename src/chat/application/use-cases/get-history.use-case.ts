import { Inject, Injectable } from '@nestjs/common';
import { IMessageRepository } from '../../domain/ports/message.repository.port';
import { Message } from '../../domain/entities/message.entity';

@Injectable()
export class GetHistoryUseCase {
  constructor(
    @Inject(IMessageRepository)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(roomId: string, limit = 50): Promise<Message[]> {
    // Validar que el roomId no esté vacío
    if (!roomId) throw new Error('El ID de la sala es requerido');

    // Retornar el historial de mensajes de la sala, limitado a los últimos 'limit' mensajes
    return await this.messageRepository.findByRoomId(roomId, limit);
  }
}
