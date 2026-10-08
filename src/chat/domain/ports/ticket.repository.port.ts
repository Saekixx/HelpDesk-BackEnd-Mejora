import { TicketParticipant } from '../entities/ticket-participant.entity';

export interface ITicketRepository {
  findById(id: number): Promise<TicketParticipant | null>;
}

export const ITicketRepository = Symbol('ITicketRepository');
