import { Request, Response } from 'express';
import { TicketService } from '../services/TicketService';
import { catchAsync } from '../utils/catchAsync';
import { AuditLogService } from '../services/AuditLogService';

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
    } = req.query;

    const result = await ticketService.getTickets({
        userId: user.id,
        userRole: user.role,
        status: status ? String(status) as any : undefined,
        priority: priority ? String(priority) as any : undefined,
        advisorId: advisorId ? String(advisorId) : undefined,
        clientId: clientId ? String(clientId) : undefined,
        search: search ? String(search) : undefined,
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
