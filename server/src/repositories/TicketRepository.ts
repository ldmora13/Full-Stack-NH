import { Prisma, Ticket } from '@prisma/client';
import { db } from '../lib/db';

export class TicketRepository {
    async create(data: Prisma.TicketCreateInput): Promise<Ticket> {
        return db.ticket.create({ data });
    }

    async findById(id: number): Promise<Ticket | null> {
        return db.ticket.findUnique({
            where: { id },
            include: {
                client: { select: { name: true, email: true } },
                advisor: { select: { name: true, email: true } },
                comments: { include: { user: { select: { name: true } } } },
                attachments: {
                    include: {
                        uploader: { select: { name: true, email: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }

    async findAll(where: Prisma.TicketWhereInput, skip: number, take: number): Promise<[Ticket[], number]> {
        const [tickets, total] = await db.$transaction([
            db.ticket.findMany({
                where,
                include: {
                    client: { select: { name: true, email: true } },
                    advisor: { select: { name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
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
                client: { select: { name: true, email: true } }
            }
        });
    }
}
