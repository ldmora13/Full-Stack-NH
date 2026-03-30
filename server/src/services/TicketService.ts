import { Ticket, TicketStatus, Priority, TicketType, Prisma } from '@prisma/client';
import { TicketRepository } from '../repositories/TicketRepository';
import { AppError } from '../utils/AppError';
import { EmailService } from './emailService';
import { WORKFLOW_CONFIG } from '../config/workflow';
import { AttachmentService } from './AttachmentService';

const validateAndSanitizeMetadata = (type: TicketType, metadata?: any) => {
    const workflowConfig = WORKFLOW_CONFIG[type as keyof typeof WORKFLOW_CONFIG];
    if (!workflowConfig) return WORKFLOW_CONFIG['OTHER'];

    // Si no hay metadata, usar el config del workflow
    if (!metadata) return workflowConfig;

    // Si tiene stages, validar que los ids sean válidos
    if (metadata.stages) {
        const validStageIds = workflowConfig.stages.map((s: any) => s.id);
        const sanitizedStages = metadata.stages.filter((s: any) =>
            validStageIds.includes(s.id) &&
            ['PENDING', 'CURRENT', 'COMPLETED'].includes(s.status)
        );
        // Si los stages no son válidos, usar los del workflow
        if (sanitizedStages.length !== workflowConfig.stages.length) {
            return workflowConfig;
        }
        return { ...workflowConfig, stages: sanitizedStages };
    }

    return workflowConfig;
};

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
            throw new AppError('Clients cannot create tickets directly. Please contact your advisor.', 403);
        }

        const ticketType = data.type || 'OTHER';

        // Validar metadata contra el workflow
        const sanitizedMetadata = validateAndSanitizeMetadata(
            ticketType as TicketType,
            data.metadata
        );

        return this.ticketRepository.create({
            title: data.title,
            description: data.description,
            priority: data.priority || 'MEDIUM',
            client: { connect: { id: data.clientId } },
            status: 'OPEN',
            type: ticketType as TicketType,
            metadata: sanitizedMetadata,
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

        if (userRole === 'CLIENT') {
            where.clientId = userId;
        } else if (userRole === 'ADVISOR') {
            where.advisorId = userId;
        }

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

        if (userRole === 'CLIENT' && ticket.clientId !== userId) {
            throw new AppError('You do not have access to this ticket', 403);
        }

        // Advisor solo puede ver tickets asignados a él
        if (userRole === 'ADVISOR' && ticket.advisorId && ticket.advisorId !== userId) {
            throw new AppError('You do not have access to this ticket', 403);
        }

        // Firmar URLs de adjuntos
        if ((ticket as any).attachments) {
            (ticket as any).attachments = await AttachmentService.signAttachments((ticket as any).attachments);
        }

        return ticket;
    }

    async updateTicket(id: number, data: {
        status?: TicketStatus;
        priority?: Priority;
        advisorId?: string;
        metadata?: any;
    }): Promise<Ticket> {
        // Si viene metadata, validarla
        const existingTicket = await this.ticketRepository.findById(id);
        if (!existingTicket) {
            throw new AppError('Ticket not found', 404);
        }

        let sanitizedData = { ...data };
        if (data.metadata) {
            sanitizedData.metadata = validateAndSanitizeMetadata(
                existingTicket.type as TicketType,
                data.metadata
            );
        }

        const updatedTicket = await this.ticketRepository.update(id, sanitizedData);

        const ticketWithClient = updatedTicket as any;
        if (data.status && ticketWithClient.client?.email) {
            await EmailService.sendTicketStatusUpdate(updatedTicket, ticketWithClient.client);
        }

        return updatedTicket;
    }
}