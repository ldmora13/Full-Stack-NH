import { z } from 'zod';
import { registry } from '../lib/openApi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const createTicket = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').openapi({ example: 'Need Help with Visa' }),
        description: z.string().min(1, 'Description is required').openapi({ example: 'I need assistance with my work visa application.' }),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().openapi({ example: 'MEDIUM' }),
        type: z.enum(['WORK_VISA', 'STUDENT_VISA', 'RESIDENCY', 'CITIZENSHIP', 'OTHER']).optional().openapi({ example: 'WORK_VISA' }),
        clientId: z.string().optional().openapi({ example: 'cm6...' }),
        metadata: z.record(z.any()).optional().openapi({ example: { checklist: [] } }),
    }),
});

export const createTicketSchema = registry.register('CreateTicket', createTicket);

const updateTicket = z.object({
    body: z.object({
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional().openapi({ example: 'IN_PROGRESS' }),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().openapi({ example: 'HIGH' }),
        advisorId: z.string().optional().openapi({ example: 'cm6...' }),
        metadata: z.record(z.any()).optional(),
    }),
    params: z.object({
        id: z.string().openapi({ example: '123' }),
    }),
});

export const updateTicketSchema = registry.register('UpdateTicket', updateTicket);

export const getTicketsSchema = registry.register('GetTickets', z.object({
    query: z.object({
        page: z.string().optional().openapi({ example: '1' }),
        limit: z.string().optional().openapi({ example: '10' }),
        status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        search: z.string().optional(),
        advisorId: z.string().optional(),
        clientId: z.string().optional(),
    }),
}));
