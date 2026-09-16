import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SendMessageDto } from '../dtos/send-message.dto';
import { IMessageRepository } from '../../domain/ports/message.repository.port';
import { ICachePort } from '../../domain/ports/cache.port';
import { Message } from '../../domain/entities/message.entity';
import { PrismaService } from '@/common/infrastructure/prisma/prisma.service';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(IMessageRepository)
    private readonly messageRepository: IMessageRepository,

    @Inject(ICachePort)
    private readonly cachePort: ICachePort,

    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: SendMessageDto): Promise<Message> {
    // Validar que el ticket exista y que el emisor sea el creador o el soporte asignado
    const idTicket = Number(dto.roomId);

    // Obtener los participantes del ticket
    const ticket = await this.prisma.tickets.findUnique({
      where: { id_tickets: idTicket },
      select: {
        id_trabajador: true,
        id_soporte: true,
        estado: true,
      },
    });

    if (!ticket) throw new NotFoundException('El ticket asociado no existe.');

    // Validar que el emisor sea el creador o el soporte asignado
    const idEmisor = Number(dto.senderId);
    const esCreador = ticket.id_trabajador === idEmisor;
    const esSoporte = ticket.id_soporte === idEmisor;

    if (!esCreador && !esSoporte) {
      throw new ForbiddenException(
        'Solo el usuario creador y el soporte asignado tienen permiso para enviar mensajes.',
      );
    }

    // Crear entidad y validar reglas del dominio
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
