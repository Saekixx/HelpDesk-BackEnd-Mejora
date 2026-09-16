import { Message } from '../entities/message.entity';

export interface IMessageRepository {
  save(message: Message): Promise<Message>;
  findByRoomId(roomId: string, limit?: number): Promise<Message[]>;
}

export const IMessageRepository = Symbol('IMessageRepository');
