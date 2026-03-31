import { Ticket, TicketStatus, Priority, TicketType, Prisma } from '@prisma/client';
import { db } from '../lib/db';
import { TicketRepository } from '../repositories/TicketRepository';
import { AppError } from '../utils/AppError';
import { EmailService } from './emailService';
import { isStaffAdminRole } from '../utils/roles';
import { WORKFLOW_CONFIG } from '../config/workflow';
import { AttachmentService } from './AttachmentService';

const ALLOWED_STAGE_STATUS = ['PENDING', 'CURRENT', 'COMPLETED'] as const;
const ALLOWED_CHECKLIST_STATUS = ['PENDING', 'UPLOADED', 'APPROVED', 'REJECTED'] as const;

const validateAndSanitizeMetadata = (type: TicketType, metadata?: any, previousMetadata?: any) => {
    const workflowConfig = WORKFLOW_CONFIG[type as keyof typeof WORKFLOW_CONFIG];
    if (!workflowConfig) return WORKFLOW_CONFIG['OTHER'];

    const safePrevious = previousMetadata && typeof previousMetadata === 'object' ? previousMetadata : {};
    const safeIncoming = metadata && typeof metadata === 'object' ? metadata : {};
    const mergedMetadata = { ...safePrevious, ...safeIncoming };

    const validStageIds = workflowConfig.stages.map((s: any) => s.id);
    const stagesFromMetadata = Array.isArray(mergedMetadata.stages) ? mergedMetadata.stages : [];
    const stageMap = new Map(stagesFromMetadata.map((s: any) => [s.id, s]));
    const sanitizedStages = workflowConfig.stages.map((stage: any, index: number) => {
        const incoming = stageMap.get(stage.id) as { status?: string } | undefined;
        const incomingStatus = incoming?.status;
        const fallbackStatus = index === 0 ? 'CURRENT' : 'PENDING';

        return {
            ...stage,
            status: (ALLOWED_STAGE_STATUS as readonly string[]).includes(incomingStatus ?? '')
                ? (incomingStatus as (typeof ALLOWED_STAGE_STATUS)[number])
                : fallbackStatus,
        };
    });

    const validChecklistIds = workflowConfig.checklist.map((c: any) => c.id);
    const checklistFromMetadata = Array.isArray(mergedMetadata.checklist) ? mergedMetadata.checklist : [];
    const checklistMap = new Map(checklistFromMetadata.map((c: any) => [c.id, c]));
    const sanitizedChecklist = workflowConfig.checklist.map((item: any) => {
        const incoming = checklistMap.get(item.id) as {
            status?: string;
            attachmentIds?: unknown;
            updatedAt?: string;
            reviewedAt?: string;
            reviewedBy?: string;
        } | undefined;
        const incomingStatus = incoming?.status;

        return {
            ...item,
            status: (ALLOWED_CHECKLIST_STATUS as readonly string[]).includes(incomingStatus ?? '')
                ? (incomingStatus as (typeof ALLOWED_CHECKLIST_STATUS)[number])
                : 'PENDING',
            attachmentIds: Array.isArray(incoming?.attachmentIds)
                ? incoming.attachmentIds.filter((id: unknown) => typeof id === 'number')
                : [],
            updatedAt: typeof incoming?.updatedAt === 'string' ? incoming.updatedAt : undefined,
            reviewedAt: typeof incoming?.reviewedAt === 'string' ? incoming.reviewedAt : undefined,
            reviewedBy: typeof incoming?.reviewedBy === 'string' ? incoming.reviewedBy : undefined,
        };
    });

    return {
        ...mergedMetadata,
        stages: sanitizedStages,
        checklist: sanitizedChecklist,
    };
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
            data.metadata,
            undefined
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
        unassignedOnly?: boolean;
        createdFrom?: Date;
        createdTo?: Date;
        page?: number;
        limit?: number;
    }): Promise<{ tickets: Ticket[]; total: number; pages: number }> {
        const {
            userId,
            userRole,
            status,
            priority,
            advisorId,
            clientId,
            search,
            unassignedOnly,
            createdFrom,
            createdTo,
            page = 1,
            limit = 10,
        } = params;

        const where: Prisma.TicketWhereInput = {};

        if (userRole === 'CLIENT') {
            where.clientId = userId;
        } else if (userRole === 'ADVISOR') {
            where.advisorId = userId;
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;

        if (advisorId && isStaffAdminRole(userRole)) {
            where.advisorId = advisorId;
        }

        if (clientId && (isStaffAdminRole(userRole) || userRole === 'ADVISOR')) {
            where.clientId = clientId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (unassignedOnly && isStaffAdminRole(userRole)) {
            where.advisorId = null;
        }

        if ((createdFrom || createdTo) && isStaffAdminRole(userRole)) {
            where.createdAt = {};
            if (createdFrom) where.createdAt.gte = createdFrom;
            if (createdTo) where.createdAt.lte = createdTo;
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
                data.metadata,
                existingTicket.metadata
            );
        }

        const updatedTicket = await this.ticketRepository.update(id, sanitizedData);

        const ticketWithClient = updatedTicket as any;
        if (data.status && ticketWithClient.client?.email) {
            await EmailService.sendTicketStatusUpdate(updatedTicket, ticketWithClient.client);
        }

        return updatedTicket;
    }

    /**
     * First-time assignment only (advisorId must be null). Atomic via updateMany to avoid double assignment.
     */
    async assignAdvisorAtomic(params: {
        ticketId: number;
        advisorId: string;
    }): Promise<Ticket> {
        const maxLoad = Number(process.env.ADVISOR_MAX_OPEN_TICKETS ?? 50);

        return db.$transaction(async (tx) => {
            const advisor = await tx.user.findUnique({ where: { id: params.advisorId } });
            if (!advisor || advisor.role !== 'ADVISOR') {
                throw new AppError('Selected user is not an available advisor', 400);
            }

            const activeLoad = await tx.ticket.count({
                where: {
                    advisorId: params.advisorId,
                    status: { in: ['OPEN', 'IN_PROGRESS'] },
                },
            });
            if (activeLoad >= maxLoad) {
                throw new AppError(
                    'Advisor has reached maximum active ticket capacity. Choose another advisor.',
                    409
                );
            }

            const ticketRow = await tx.ticket.findUnique({ where: { id: params.ticketId } });
            if (!ticketRow) {
                throw new AppError('Ticket not found', 404);
            }
            if (ticketRow.advisorId !== null) {
                throw new AppError('Ticket already assigned', 409);
            }

            const nextStatus: TicketStatus =
                ticketRow.status === 'OPEN' ? 'IN_PROGRESS' : ticketRow.status;

            const updated = await tx.ticket.updateMany({
                where: { id: params.ticketId, advisorId: null },
                data: {
                    advisorId: params.advisorId,
                    status: nextStatus,
                },
            });

            if (updated.count !== 1) {
                throw new AppError('Ticket already assigned', 409);
            }

            const full = await tx.ticket.findUnique({
                where: { id: params.ticketId },
                include: {
                    client: { select: { id: true, name: true, email: true, role: true } },
                    advisor: { select: { id: true, name: true, email: true, role: true } },
                },
            });

            if (!full) {
                throw new AppError('Ticket not found', 404);
            }

            return full as Ticket;
        });
    }
}