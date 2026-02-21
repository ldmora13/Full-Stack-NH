import { Request, Response } from 'express';
import { db } from '../lib/db';

export const getCommentsByTicket = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;
        const user = res.locals.user;

        // Check if user has access to this ticket
        const ticket = await db.ticket.findUnique({
            where: { id: Number(ticketId) }
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Authorization: clients can only see their own tickets
        if (user.role === 'CLIENT' && ticket.clientId !== user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const comments = await db.comment.findMany({
            where: { ticketId: Number(ticketId) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;
        const { content } = req.body;
        const user = res.locals.user;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if ticket exists and user has access
        const ticket = await db.ticket.findUnique({
            where: { id: Number(ticketId) }
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Authorization: clients can only comment on their own tickets
        if (user.role === 'CLIENT' && ticket.clientId !== user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const comment = await db.comment.create({
            data: {
                content,
                ticketId: Number(ticketId),
                userId: user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                }
            }
        });

        res.status(201).json({ comment });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Error creating comment' });
    }
};
