export class ChatRoom {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly participants: string[],
    public readonly createdAt: Date = new Date(),
  ) {}
}
