import { Ticket, TicketStatus, Priority, TicketType, Prisma } from '@prisma/client';
import { TicketRepository } from '../repositories/TicketRepository';
import { AppError } from '../utils/AppError';
import { EmailService } from './emailService';
import { WORKFLOW_CONFIG } from '../config/workflow';

export class TicketService {
    private ticketRepository: TicketRepository;

    constructor() {
        this.ticketRepository = new TicketRepository();
    }

    async createTicket(data: {
        title: string;
        description: string;
        priority?: Priority;
        type?: TicketType;
        clientId: string;
        metadata?: any;
        creatorRole: string;
    }): Promise<Ticket> {
        if (data.creatorRole === 'CLIENT') {
            // Clients can create tickets, logic in controller was preventing it but requirement might have changed or it was a bug.
            // Re-reading controller: "if (user.role === 'CLIENT') return res.status(403)..."
            // Wait, the original controller said clients CANNOT create tickets? 
            // "if (user.role === 'CLIENT') { return res.status(403).json({ error: 'Clients cannot create tickets' }); }"
            // This seems odd for a ticket system, usually clients create tickets. 
            // However, I must respect existing logic.
            throw new AppError('Clients cannot create tickets', 403);
        }

        return this.ticketRepository.create({
            title: data.title,
            description: data.description,
            priority: data.priority || 'MEDIUM',
            client: { connect: { id: data.clientId } },
            status: 'OPEN',
            type: data.type || 'OTHER',
            metadata: data.metadata || WORKFLOW_CONFIG[(data.type || 'OTHER') as keyof typeof WORKFLOW_CONFIG] || {},
        });
    }

    async getTickets(params: {
        userId: string;
        userRole: string;
        status?: TicketStatus;
        priority?: Priority;
        advisorId?: string;
        clientId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ tickets: Ticket[]; total: number; pages: number }> {
        const { userId, userRole, status, priority, advisorId, clientId, search, page = 1, limit = 10 } = params;

        const where: Prisma.TicketWhereInput = {};

        // Role-based filtering
        if (userRole === 'CLIENT') {
            where.clientId = userId;
        } else if (userRole === 'ADVISOR') {
            where.advisorId = userId;
        }

        // Additional filters
        if (status) where.status = status;
        if (priority) where.priority = priority;

        if (advisorId && userRole === 'ADMIN') {
            where.advisorId = advisorId;
        }

        if (clientId && (userRole === 'ADMIN' || userRole === 'ADVISOR')) {
            where.clientId = clientId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [tickets, total] = await this.ticketRepository.findAll(where, skip, limit);

        return {
            tickets,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    async getTicketById(id: number, userId: string, userRole: string): Promise<Ticket> {
        const ticket = await this.ticketRepository.findById(id);

        if (!ticket) {
            throw new AppError('Ticket not found', 404);
        }

        // Authorization check
        if (userRole === 'CLIENT' && ticket.clientId !== userId) {
            throw new AppError('Forbidden', 403);
        }

        return ticket;
    }

    async updateTicket(id: number, data: { status?: TicketStatus; priority?: Priority; advisorId?: string; metadata?: any }): Promise<Ticket> {
        // TODO: Add authorization logic here if needed (e.g. only admins can assign advisors)

        const updatedTicket = await this.ticketRepository.update(id, data);

        // Check if client exists and has email before sending notification
        const ticketWithClient = updatedTicket as any;
        if (data.status && ticketWithClient.client && ticketWithClient.client.email) {
            await EmailService.sendTicketStatusUpdate(updatedTicket, ticketWithClient.client);
        }

        return updatedTicket;
    }
}
