import { Request, Response } from 'express';
import { db } from '../lib/db';

export const uploadAttachment = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;
        const { filename, fileSize, mimeType } = req.body;
        const user = res.locals.user;

        // Get ticket
        const ticket = await db.ticket.findUnique({
            where: { id: Number(ticketId) }
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Caso no encontrado' });
        }

        // Check if case is closed
        if (ticket.status === 'CLOSED') {
            return res.status(403).json({ error: 'No se pueden adjuntar archivos a un caso cerrado' });
        }

        // Authorization: clients can only upload to their own tickets
        if (user.role === 'CLIENT' && ticket.clientId !== user.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        // TODO: Upload to Cloudflare R2
        // For now, create a mock URL
        const mockUrl = `https://mockcdn.example.com/attachments/${Date.now()}-${filename}`;

        const attachment = await db.attachment.create({
            data: {
                filename,
                url: mockUrl,
                size: fileSize,
                fileType: mimeType,
                ticketId: Number(ticketId),
                uploaderId: user.id,
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                }
            }
        });

        res.status(201).json({ attachment });
    } catch (error) {
        console.error('Error uploading attachment:', error);
        res.status(500).json({ error: 'Error al subir archivo' });
    }
};

export const getAttachments = async (req: Request, res: Response) => {
    try {
        const { ticketId } = req.params;
        const user = res.locals.user;

        // Get ticket to check access
        const ticket = await db.ticket.findUnique({
            where: { id: Number(ticketId) }
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Caso no encontrado' });
        }

        // Authorization check
        if (user.role === 'CLIENT' && ticket.clientId !== user.id) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const attachments = await db.attachment.findMany({
            where: { ticketId: Number(ticketId) },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ attachments });
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ error: 'Error al obtener archivos' });
    }
};
