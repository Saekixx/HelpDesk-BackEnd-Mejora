export class Message {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly createdAt: Date = new Date(),
  ) {}

  public static create(
    roomId: string,
    senderId: string,
    content: string,
  ): Message {
    if (!content || content.trim().length === 0) {
      throw new Error('El mensaje no puede estar vacío');
    }
    return new Message(crypto.randomUUID(), roomId, senderId, content.trim());
  }
}
