import { Injectable, Inject } from '@nestjs/common';
import { ICachePort } from '../../../domain/ports/cache.port';
import Redis from 'ioredis';

@Injectable()
export class RedisAdapter implements ICachePort {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  // Metodo para establecer un usuario como en línea
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    await this.redisClient.set(`online_user:${userId}`, socketId);
  }

  // Metodo para establecer un usuario como fuera de línea
  async setUserOffline(userId: string): Promise<void> {
    await this.redisClient.del(`online_user:${userId}`);
  }

  // Metodo para obtener el socketId de un usuario en línea
  async getOnlineUser(userId: string): Promise<string | null> {
    return await this.redisClient.get(`online_user:${userId}`);
  }

  // Metodo para publicar un mensaje en un canal de Redis Pub/Sub
  async publishMessage(channel: string, message: any): Promise<void> {
    await this.redisClient.publish(channel, JSON.stringify(message));
  }
}
