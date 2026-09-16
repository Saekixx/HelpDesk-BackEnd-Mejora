import { TicketFilterCriteria } from '@/tickets/domain/criteria/ticket-filter.criteria';
import {
  PaginatedTicketsResult,
  TICKET_REPOSITORY,
  TicketRepositoryPort,
} from '@/tickets/domain/ports/ticket.repository.port';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetTicketsUseCase {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepositoryPort,
  ) {}

  async execute(
    filters: TicketFilterCriteria,
  ): Promise<PaginatedTicketsResult> {
    return await this.ticketRepository.findAllWhitFilters(filters);
  }
}
