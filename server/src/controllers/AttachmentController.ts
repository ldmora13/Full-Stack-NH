import { Request, Response } from 'express';
import { db } from '../lib/db';
import { catchAsync } from '../utils/catchAsync';
import { AuditLogService } from '../services/AuditLogService';
import { r2Client, R2_CONFIG } from '../config/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { AttachmentService } from '../services/AttachmentService';
import path from 'path';

export const uploadAttachment = catchAsync(async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const file = (req as any).file;
    const user = res.locals.user;

    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const key = `tickets/${ticketId}/${uniqueSuffix}-${file.originalname}`;

    await r2Client.send(new PutObjectCommand({
        Bucket: R2_CONFIG.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }));

    // For R2, the direct URL might not be public.
    // We'll store the key as the URL or a base URL.
    // For now, let's store the key prefixing it with 'r2://' to distinguish it from local files.
    const url = `r2://${key}`;

    const attachment = await db.attachment.create({
        data: {
            filename: file.originalname,
            url: url,
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

    // Generate signed URLs for R2 attachments
    const attachmentsWithUrls = await AttachmentService.signAttachments(attachments);

    res.json({ attachments: attachmentsWithUrls });
});
