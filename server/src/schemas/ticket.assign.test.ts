import { describe, it, expect } from 'vitest';
import { assignAdvisorSchema } from './ticket.schema';

describe('assignAdvisorSchema', () => {
    it('accepts a valid body and params', async () => {
        const data = {
            body: { advisorId: 'uuid-advisor-1' },
            params: { id: '42' },
            query: {},
        };
        await expect(assignAdvisorSchema.parseAsync(data)).resolves.toBeDefined();
    });

    it('rejects empty advisorId', async () => {
        const data = {
            body: { advisorId: '' },
            params: { id: '42' },
            query: {},
        };
        await expect(assignAdvisorSchema.parseAsync(data)).rejects.toThrow();
    });
});
