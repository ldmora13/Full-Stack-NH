import { db } from '../lib/db';

export class AuditLogService {
    static async log(data: {
        action: string;
        entity: string;
        entityId: string;
        userId: string;
        details?: any;
    }) {
        try {
            await db.auditLog.create({
                data: {
                    action: data.action,
                    entity: data.entity,
                    entityId: data.entityId,
                    userId: data.userId,
                    details: data.details ? JSON.stringify(data.details) : null
                }
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error to avoid blocking the main operation
        }
    }
}
