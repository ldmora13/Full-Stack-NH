import { registry } from '../lib/openApi';
import { createTicketSchema, updateTicketSchema, getTicketsSchema } from '../schemas/ticket.schema';
import { z } from 'zod';

registry.registerPath({
    method: 'post',
    path: '/tickets',
    description: 'Create a new ticket',
    summary: 'Create Ticket',
    tags: ['Tickets'],
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: createTicketSchema.shape.body,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Ticket created successfully',
        },
        400: { description: 'Validation Error' },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get',
    path: '/tickets',
    description: 'Get a list of tickets with filtering and pagination',
    summary: 'Get Tickets',
    tags: ['Tickets'],
    security: [{ cookieAuth: [] }],
    request: {
        query: getTicketsSchema.shape.query,
    },
    responses: {
        200: {
            description: 'List of tickets',
            content: {
                'application/json': {
                    schema: z.object({
                        tickets: z.array(z.any()),
                        pagination: z.object({
                            page: z.number(),
                            limit: z.number(),
                            total: z.number(),
                            totalPages: z.number(),
                        }),
                    }),
                },
            },
        },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'get',
    path: '/tickets/{id}',
    description: 'Get a specific ticket by ID',
    summary: 'Get Ticket by ID',
    tags: ['Tickets'],
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
    },
    responses: {
        200: {
            description: 'Ticket details',
        },
        404: { description: 'Ticket not found' },
        401: { description: 'Unauthorized' },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/tickets/{id}',
    description: 'Update a ticket',
    summary: 'Update Ticket',
    tags: ['Tickets'],
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.string() }),
        body: {
            content: {
                'application/json': {
                    schema: updateTicketSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Ticket updated successfully',
        },
        404: { description: 'Ticket not found' },
        401: { description: 'Unauthorized' },
    },
});
