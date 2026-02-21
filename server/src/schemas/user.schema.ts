import { z } from 'zod';
import { registry } from '../lib/openApi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const createUserSchema = registry.register('CreateUser', z.object({
    body: z.object({
        email: z.string().email('Invalid email address').openapi({ example: 'newuser@example.com' }),
        password: z.string().min(6, 'Password must be at least 6 characters').openapi({ example: 'strongPassword' }),
        name: z.string().min(1, 'Name is required').openapi({ example: 'Jane Doe' }),
        role: z.enum(['ADMIN', 'ADVISOR', 'CLIENT']).openapi({ example: 'CLIENT' }),
    }),
}));

export const updateUserSchema = registry.register('UpdateUser', z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').optional().openapi({ example: 'Jane Updated' }),
        role: z.enum(['ADMIN', 'ADVISOR', 'CLIENT']).optional().openapi({ example: 'ADVISOR' }),
    }),
    params: z.object({
        id: z.string().openapi({ example: 'cm6...' }),
    }),
}));

export const getUsersSchema = registry.register('GetUsers', z.object({
    query: z.object({
        role: z.enum(['ADMIN', 'ADVISOR', 'CLIENT']).optional(),
    }),
}));
