import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';
import { catchAsync } from '../utils/catchAsync';
import { AuditLogService } from '../services/AuditLogService';
import { EmailService } from '../services/emailService';

const ticketService = new TicketService();

export const createTicket = catchAsync(async (req: Request, res: Response) => {
    const { title, description, priority, clientId, type, metadata } = req.body;
    const user = res.locals.user;

    const ticket = await ticketService.createTicket({
        title,
        description,
        priority,
        type,
        clientId: clientId || user.id, // Use provided clientId or default to creator's ID
        metadata,
        creatorRole: user.role
    });

    res.status(201).json({ ticket });
});

export const getTickets = catchAsync(async (req: Request, res: Response) => {
    const user = res.locals.user;
    const {
        status,
        priority,
        advisorId,
        clientId,
        search,
        page,
        limit,
        unassignedOnly,
        createdFrom,
        createdTo,
    } = req.query;

    const result = await ticketService.getTickets({
        userId: user.id,
        userRole: user.role,
        status: status ? String(status) as any : undefined,
        priority: priority ? String(priority) as any : undefined,
        advisorId: advisorId ? String(advisorId) : undefined,
        clientId: clientId ? String(clientId) : undefined,
        search: search ? String(search) : undefined,
        unassignedOnly: unassignedOnly === 'true' || unassignedOnly === '1',
        createdFrom: (() => {
            if (!createdFrom) return undefined;
            const d = new Date(String(createdFrom));
            return Number.isNaN(d.getTime()) ? undefined : d;
        })(),
        createdTo: (() => {
            if (!createdTo) return undefined;
            const d = new Date(String(createdTo));
            return Number.isNaN(d.getTime()) ? undefined : d;
        })(),
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
    });

    res.json({
        tickets: result.tickets,
        pagination: {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            total: result.total,
            totalPages: result.pages,
        }
    });
});

export const getTicketById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = res.locals.user;

    const ticket = await ticketService.getTicketById(Number(id), user.id, user.role);

    res.json({ ticket });
});

export const updateTicket = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, priority, advisorId, metadata } = req.body;

    const ticket = await ticketService.updateTicket(Number(id), {
        status,
        priority,
        advisorId,
        metadata
    });

    await AuditLogService.log({
        action: 'UPDATE_TICKET',
        entity: 'TICKET',
        entityId: id,
        userId: res.locals.user.id,
        details: { status, priority, advisorId }
    });

    res.json({ ticket });
});

export const assignAdvisor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { advisorId } = req.body;
    const user = res.locals.user;

    const ticket = await ticketService.assignAdvisorAtomic({
        ticketId: Number(id),
        advisorId: String(advisorId),
    });

    await AuditLogService.log({
        action: 'ASSIGN_TICKET',
        entity: 'TICKET',
        entityId: String(id),
        userId: user.id,
        details: {
            advisorId,
            clientId: (ticket as { clientId: string }).clientId,
            ticketTitle: ticket.title,
        },
    });

    const advisorEmail = (ticket as { advisor?: { email?: string; name?: string } }).advisor?.email;
    const advisorName = (ticket as { advisor?: { email?: string; name?: string } }).advisor?.name;
    if (advisorEmail && advisorName) {
        try {
            await EmailService.sendTicketAssignedToAdvisor(
                ticket as { id: number; title: string; client?: { name?: string } },
                { email: advisorEmail, name: advisorName }
            );
        } catch (e) {
            console.error('Failed to notify advisor of assignment:', e);
        }
    }

    res.json({ ticket });
});
