import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { catchAsync } from '../utils/catchAsync';

const userService = new UserService();

export const getUsers = catchAsync(async (req: Request, res: Response) => {
    const { role } = req.query;
    const users = await userService.getUsers(role as any);

    // Scrub sensitive data usually handled by repository/service but ensuring here for safety if not handled
    const sanitizedUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
    });

    res.json({ users: sanitizedUsers });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    const user = await userService.createUser({
        email,
        password,
        name,
        role: role as any
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await userService.updateUser(id, { name, role });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
});
