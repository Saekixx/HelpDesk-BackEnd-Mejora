import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SendMessageDto } from '../dtos/send-message.dto';
import { IMessageRepository } from '../../domain/ports/message.repository.port';
import { ICachePort } from '../../domain/ports/cache.port';
import { ITicketRepository } from '../../domain/ports/ticket.repository.port';
import { Message } from '../../domain/entities/message.entity';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(IMessageRepository)
    private readonly messageRepository: IMessageRepository,

    @Inject(ICachePort)
    private readonly cachePort: ICachePort,

    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(dto: SendMessageDto): Promise<Message> {
    const idTicket = Number(dto.roomId);
    const idEmisor = Number(dto.senderId);

    // Obtener ticket a través del puerto (dominio/infraestructura abstraida)
    const ticket = await this.ticketRepository.findById(idTicket);

    if (!ticket) {
      throw new NotFoundException('El ticket asociado no existe.');
    }

    // Validar reglas de acceso usando el método de la entidad del ticket
    if (!ticket.canAccess(idEmisor)) {
      throw new ForbiddenException(
        'Solo el usuario creador y el soporte asignado tienen permiso para enviar mensajes.',
      );
    }

    // Crear entidad y validar reglas del dominio del mensaje
    const message = Message.create(dto.roomId, dto.senderId, dto.content);

    // Persistir en MongoDB
    const savedMessage = await this.messageRepository.save(message);

    // Publicar evento en Redis
    await this.cachePort.publishMessage(
      `chat:room:${dto.roomId}`,
      savedMessage,
    );

    return savedMessage;
  }
}
