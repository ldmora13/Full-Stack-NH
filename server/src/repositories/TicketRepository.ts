import { Prisma, Ticket } from '@prisma/client';
import { db } from '../lib/db';

export class TicketRepository {
    async create(data: Prisma.TicketCreateInput): Promise<Ticket> {
        return db.ticket.create({ data });
    }

    // Incluir payments y appointments 
    async findById(id: number): Promise<Ticket | null> {
        return db.ticket.findUnique({
            where: { id },
            include: {
                client: {
                    select: { id: true, name: true, email: true, role: true }
                },
                advisor: {
                    select: { id: true, name: true, email: true, role: true }
                },
                comments: {
                    include: {
                        user: {
                            select: { id: true, name: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                attachments: {
                    include: {
                        uploader: {
                            select: { id: true, name: true, email: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        amount: true,
                        currency: true,
                        status: true,
                        paypalOrderId: true,
                        createdAt: true,
                    }
                },
                appointments: {
                    orderBy: { date: 'asc' },
                    select: {
                        id: true,
                        date: true,
                        type: true,
                        status: true,
                        link: true,
                        ticketId: true,
                    }
                },
            }
        }) as any;
    }

    async findAll(where: Prisma.TicketWhereInput, skip: number, take: number): Promise<[Ticket[], number]> {
        const [tickets, total] = await db.$transaction([
            db.ticket.findMany({
                where,
                include: {
                    client: { select: { id: true, name: true, email: true } },
                    advisor: { select: { id: true, name: true, email: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take,
            }),
            db.ticket.count({ where }),
        ]);

        return [tickets, total];
    }

    async update(id: number, data: Prisma.TicketUpdateInput): Promise<Ticket> {
        return db.ticket.update({
            where: { id },
            data,
            include: {
                client: { select: { id: true, name: true, email: true } },
                advisor: { select: { id: true, name: true, email: true } },
            }
        });
    }
}