export interface ICachePort {
  setUserOnline(userId: string, socketId: string): Promise<void>;
  setUserOffline(userId: string): Promise<void>;
  getOnlineUser(userId: string): Promise<string | null>;
  publishMessage(channel: string, message: any): Promise<void>;
}

export const ICachePort = Symbol('ICachePort');
