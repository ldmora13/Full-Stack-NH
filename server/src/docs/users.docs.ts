import { registry } from '../lib/openApi';
import { createUserSchema, updateUserSchema, getUsersSchema } from '../schemas/user.schema';
import { z } from 'zod';

registry.registerPath({
    method: 'get',
    path: '/users',
    description: 'Get a list of users (Admin only)',
    summary: 'Get Users',
    tags: ['Users'],
    security: [{ cookieAuth: [] }],
    request: {
        query: getUsersSchema.shape.query,
    },
    responses: {
        200: {
            description: 'List of users',
        },
        403: { description: 'Forbidden' },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'post',
    path: '/users',
    description: 'Create a new user (Admin only)',
    summary: 'Create User',
    tags: ['Users'],
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createUserSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created successfully',
        },
        403: { description: 'Forbidden' },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/users/{id}',
    description: 'Update a user (Admin only)',
    summary: 'Update User',
    tags: ['Users'],
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
        body: {
            content: {
                'application/json': {
                    schema: updateUserSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'User updated successfully',
        },
        403: { description: 'Forbidden' },
        401: { description: 'Unauthorized' },
    },
});
