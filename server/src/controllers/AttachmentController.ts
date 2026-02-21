import { Request, Response } from 'express';
import { db } from '../lib/db';
import { catchAsync } from '../utils/catchAsync';
import { AuditLogService } from '../services/AuditLogService';

export const uploadAttachment = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const file = (req as any).file;
    const user = res.locals.user;

    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const attachment = await db.attachment.create({
        data: {
            filename: file.originalname,
            url: `/uploads/${file.filename}`, // In a real app, upload to S3/Cloudinary
            size: file.size,
            fileType: file.mimetype,
            ticketId: Number(ticketId),
            uploaderId: user.id
        },
        include: {
            uploader: {
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    await AuditLogService.log({
        action: 'UPLOAD_FILE',
        entity: 'ATTACHMENT',
        entityId: String(attachment.id),
        userId: user.id,
        details: { filename: file.originalname, ticketId }
    });

    res.status(201).json({ attachment });
});

export const getAttachments = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    const attachments = await db.attachment.findMany({
        where: { ticketId: Number(ticketId) },
        include: {
            uploader: {
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ attachments });
});
