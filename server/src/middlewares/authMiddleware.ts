import { Request, Response, NextFunction } from 'express';
import { lucia } from '../lib/auth';

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
    const sessionId = req.cookies.auth_session ?? lucia.readBearerToken(req.headers.authorization ?? "");

    if (!sessionId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        res.setHeader('Set-Cookie', sessionCookie.serialize());
    }

    res.locals.user = user;
    res.locals.session = session;

    next();
};
