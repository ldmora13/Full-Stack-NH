import { Request, Response } from 'express';
import { db } from '../lib/db';

export const getTicketStats = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;

        // Define the where clause based on user role
        let where = {};
        if (user.role === 'CLIENT') {
            where = { clientId: user.id };
        } else if (user.role === 'ADVISOR') {
            where = { advisorId: user.id };
        }
        // Admin sees all tickets (empty where)

        // Count tickets by status
        const [open, inProgress, resolved, closed] = await Promise.all([
            db.ticket.count({ where: { ...where, status: 'OPEN' } }),
            db.ticket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
            db.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
            db.ticket.count({ where: { ...where, status: 'CLOSED' } }),
        ]);

        res.json({
            stats: {
                open,
                inProgress,
                resolved,
                closed,
                total: open + inProgress + resolved + closed,
            }
        });
    } catch (error) {
        console.error('Error fetching ticket stats:', error);
        res.status(500).json({ error: 'Error fetching statistics' });
    }
};

export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        const user = res.locals.user;

        // Define the where clause based on user role
        let where = {};
        if (user.role === 'CLIENT') {
            where = { clientId: user.id };
        } else if (user.role === 'ADVISOR') {
            where = { advisorId: user.id };
        }
        // Admin sees all tickets (empty where)

        // Get the 5 most recently updated tickets
        const recentTickets = await db.ticket.findMany({
            where,
            include: {
                client: { select: { name: true } },
                advisor: { select: { name: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 5,
        });

        res.json({ activity: recentTickets });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ error: 'Error fetching recent activity' });
    }
};
