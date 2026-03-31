import { z } from 'zod';
import { registry } from '../lib/openApi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const signupSchema = registry.register('Signup', z.object({
    body: z.object({
        email: z.string().email('Invalid email address').openapi({ example: 'user@example.com' }),
        password: z.string().min(6, 'Password must be at least 6 characters').openapi({ example: 'password123' }),
        name: z.string().min(1, 'Name is required').openapi({ example: 'John Doe' }),
        role: z.literal('CLIENT').optional().openapi({ example: 'CLIENT' }),
    }),
}));

export const loginSchema = registry.register('Login', z.object({
    body: z.object({
        email: z.string().email('Invalid email address').openapi({ example: 'user@example.com' }),
        password: z.string().min(1, 'Password is required').openapi({ example: 'password123' }),
    }),
}));

export const changePasswordSchema = registry.register('ChangePassword', z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required').openapi({ example: 'oldPassword123' }),
        newPassword: z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Must contain at least one number')
            .openapi({ example: 'NewPassword123' }),
    }),
}));