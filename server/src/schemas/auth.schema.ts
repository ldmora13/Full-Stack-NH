import { z } from 'zod';
import { registry } from '../lib/openApi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const signupSchema = registry.register('Signup', z.object({
    body: z.object({
        email: z.string().email('Invalid email address').openapi({ example: 'user@example.com' }),
        password: z.string().min(6, 'Password must be at least 6 characters').openapi({ example: 'password123' }),
        name: z.string().min(1, 'Name is required').openapi({ example: 'John Doe' }),
        role: z.enum(['ADMIN', 'ADVISOR', 'CLIENT']).optional().openapi({ example: 'CLIENT' }),
    }),
}));

export const loginSchema = registry.register('Login', z.object({
    body: z.object({
        email: z.string().email('Invalid email address').openapi({ example: 'user@example.com' }),
        password: z.string().min(1, 'Password is required').openapi({ example: 'password123' }),
    }),
}));
