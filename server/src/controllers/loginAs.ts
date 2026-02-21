import { Request, Response } from 'express';
import { db } from '../lib/db';
import { lucia } from '../lib/auth';

export const loginAs = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUser = res.locals.user;

        // Only admins can login as other users
        if (currentUser.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Only admins can use this feature' });
        }

        // Get target user
        const targetUser = await db.user.findUnique({
            where: { id: userId }
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create new session for target user
        const session = await lucia.createSession(targetUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        res.json({
            user: {
                id: targetUser.id,
                email: targetUser.email,
                name: targetUser.name,
                role: targetUser.role,
            }
        });
    } catch (error) {
        console.error('Error in loginAs:', error);
        res.status(500).json({ error: 'Error switching user' });
    }
};
