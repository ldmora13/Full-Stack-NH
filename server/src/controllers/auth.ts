import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { catchAsync } from '../utils/catchAsync';
import { lucia } from '../lib/auth';
import { AuditLogService } from '../services/AuditLogService';
import { db } from '../lib/db';
import { verify, hash } from '@node-rs/argon2';
import { AppError } from '../utils/AppError';

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

    if (session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        res.setHeader("Set-Cookie", sessionCookie.serialize());
    }

    const { password: _, ...userWithoutPassword } = user as any;
    res.status(200).json({ user: userWithoutPassword });
});

// Endpoint para cambio de contraseña
export const changePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const user = res.locals.user;

    if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
        throw new AppError('New password must be at least 8 characters', 400);
    }

    if (!/[A-Z]/.test(newPassword)) {
        throw new AppError('New password must contain at least one uppercase letter', 400);
    }

    if (!/[0-9]/.test(newPassword)) {
        throw new AppError('New password must contain at least one number', 400);
    }

    // Obtener el usuario completo (con contraseña) desde la DB
    const fullUser = await db.user.findUnique({ where: { id: user.id } });
    if (!fullUser) {
        throw new AppError('User not found', 404);
    }

    // Verificar contraseña actual
    const validPassword = await verify(fullUser.password, currentPassword);
    if (!validPassword) {
        throw new AppError('Current password is incorrect', 400);
    }

    // No permitir la misma contraseña
    const samePassword = await verify(fullUser.password, newPassword);
    if (samePassword) {
        throw new AppError('New password must be different from current password', 400);
    }

    const hashedPassword = await hash(newPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
    });

    await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    // Invalidar todas las sesiones del usuario (seguridad)
    await lucia.invalidateUserSessions(user.id);

    // Crear nueva sesión para que no se cierre la sesión actual
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.setHeader("Set-Cookie", sessionCookie.serialize());

    await AuditLogService.log({
        action: 'CHANGE_PASSWORD',
        entity: 'USER',
        entityId: user.id,
        userId: user.id
    });

    res.status(200).json({ message: 'Password changed successfully' });
});