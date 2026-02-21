import { registry } from '../lib/openApi';
import { signupSchema, loginSchema } from '../schemas/auth.schema';
import { z } from 'zod';

registry.registerPath({
    method: 'post',
    path: '/auth/signup',
    description: 'Register a new user',
    summary: 'Sign up',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: signupSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        user: z.object({
                            id: z.string(),
                            email: z.string(),
                            name: z.string(),
                            role: z.enum(['ADMIN', 'ADVISOR', 'CLIENT']),
                        }),
                    }),
                },
            },
        },
        400: {
            description: 'Bad Request',
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/auth/login',
    description: 'Login with email and password',
    summary: 'Login',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: loginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Login successful',
            content: {
                'application/json': {
                    schema: z.object({
                        user: z.object({
                            id: z.string(),
                            email: z.string(),
                            name: z.string(),
                            role: z.enum(['ADMIN', 'ADVISOR', 'CLIENT']),
                        }),
                    }),
                },
            },
        },
        400: {
            description: 'Invalid credentials',
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    description: 'Logout the current user',
    summary: 'Logout',
    tags: ['Auth'],
    responses: {
        200: {
            description: 'Logout successful',
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/auth/me',
    description: 'Get current authenticated user',
    summary: 'Get Me',
    tags: ['Auth'],
    responses: {
        200: {
            description: 'Current user',
            content: {
                'application/json': {
                    schema: z.object({
                        user: z.object({
                            id: z.string(),
                            email: z.string(),
                            name: z.string(),
                            role: z.enum(['ADMIN', 'ADVISOR', 'CLIENT']),
                        }),
                    }),
                },
            },
        },
        401: {
            description: 'Unauthorized',
        },
    },
});
