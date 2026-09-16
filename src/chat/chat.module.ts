import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  MessageSchema,
  MessageSchemaFactory,
} from './infrastructure/persistence/mongo/schemas/message.schema';

import { IMessageRepository } from './domain/ports/message.repository.port';
import { ICachePort } from './domain/ports/cache.port';

import { MongoMessageRepository } from './infrastructure/persistence/mongo/mongo-message.repository';
import { RedisAdapter } from './infrastructure/cache/redis/redis.adapter';

import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetHistoryUseCase } from './application/use-cases/get-history.use-case';

import { ChatGateway } from './infrastructure/websockets/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageSchema.name, schema: MessageSchemaFactory },
    ]),
  ],
  providers: [
    {
      provide: IMessageRepository,
      useClass: MongoMessageRepository,
    },
    {
      provide: ICachePort,
      useClass: RedisAdapter,
    },

    // Casos de uso
    SendMessageUseCase,
    GetHistoryUseCase,

    // Gateway de WebSocket
    ChatGateway,
  ],
})
export class ChatModule {}
