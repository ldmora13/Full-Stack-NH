import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { catchAsync } from '../utils/catchAsync';
import { lucia } from '../lib/auth';
import { AuditLogService } from '../services/AuditLogService';

const authService = new AuthService();

export const signup = catchAsync(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    const { user, sessionCookie } = await authService.signup({
        email,
        password,
        name,
        role
    });

    res.setHeader("Set-Cookie", sessionCookie.serialize());
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, sessionCookie } = await authService.login({ email, password });

    await AuditLogService.log({
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        userId: user.id
    });

    res.setHeader("Set-Cookie", sessionCookie.serialize());
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");

    if (!sessionId) {
        res.status(200).send();
        return;
    }

    const sessionCookie = await authService.logout(sessionId);

    // We might not have user info easily here without extra lookup, but for now we skip userId or decode session if needed.
    // Actually, we can get user from session if we validated it before, but logout just invalidates.
    // Let's check `validateSession` usage in getMe. 
    // For now, let's skip logging logout or try to get user if possible.
    // Simplifying: skipping logout log for MVP as it requires resolving session to user.

    res.setHeader("Set-Cookie", sessionCookie.serialize());
    res.status(200).send();
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
    const cookieHeader = req.headers.cookie ?? "";
    const sessionId = lucia.readSessionCookie(cookieHeader);

    if (!sessionId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const { session, user } = await authService.validateSession(sessionId);

    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        res.setHeader("Set-Cookie", sessionCookie.serialize());
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        res.setHeader("Set-Cookie", sessionCookie.serialize());
    }

    // Don't send password hash
    const { password: _, ...userWithoutPassword } = user as any;
    res.status(200).json({ user: userWithoutPassword });
});
