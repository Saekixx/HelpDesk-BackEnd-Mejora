import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMessageRepository } from '../../../domain/ports/message.repository.port';
import { Message } from '../../../domain/entities/message.entity';
import { MessageDocument, MessageSchema } from './schemas/message.schema';

// Implementacion del repositorio de mensajes utilizando MongoDB y Mongoose
// Los datos se obtienen de la base de datos NoSQL MongoDB

@Injectable()
export class MongoMessageRepository implements IMessageRepository {
  constructor(
    @InjectModel(MessageSchema.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  // Implementación del método save para guardar un mensaje en la base de datos (MongoDB)
  async save(message: Message): Promise<Message> {
    const createdMessage = new this.messageModel({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
    });
    await createdMessage.save();
    return message;
  }

  // Implementación del método findByRoomId para obtener mensajes por roomId con un límite opcional
  async findByRoomId(roomId: string, limit = 50): Promise<Message[]> {
    const docs = await this.messageModel
      .find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Mapeamos los esquemas de Mongoose de vuelta a Entidades puras de Dominio
    return docs.map(
      (doc) =>
        new Message(
          doc.id,
          doc.roomId,
          doc.senderId,
          doc.content,
          doc.createdAt,
        ),
    );
  }
}
