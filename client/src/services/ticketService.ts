import api from '../lib/api';

export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    client: {
        name: string;
        email: string;
    };
    advisor?: {
        name: string;
        email: string;
    };
    attachments?: Array<{
        id: number;
        filename: string;
        url: string;
        fileType: string | null;
        size: number | null;
        createdAt: string;
        uploader: {
            name: string;
            email: string;
        };
    }>;
    payments?: Array<{
        id: number;
        amount: number;
        currency: string;
        status: string;
        createdAt: string;
    }>;
    type: string;
    metadata?: any;
}

export interface CreateTicketData {
    title: string;
    description: string;
    priority: string;
    type?: string;
    metadata?: any;
}

export interface TicketFilters {
    status?: string;
    priority?: string;
    advisorId?: string;
    clientId?: string;
    search?: string;
    unassignedOnly?: boolean;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    limit?: number;
}

export const TicketService = {
    getAll: async (params?: TicketFilters) => {
        const query: Record<string, string | number | boolean> = {};
        if (params?.status) query.status = params.status;
        if (params?.priority) query.priority = params.priority;
        if (params?.advisorId) query.advisorId = params.advisorId;
        if (params?.clientId) query.clientId = params.clientId;
        if (params?.search) query.search = params.search;
        if (params?.unassignedOnly) query.unassignedOnly = 'true';
        if (params?.createdFrom) query.createdFrom = params.createdFrom;
        if (params?.createdTo) query.createdTo = params.createdTo;
        if (params?.page != null) query.page = params.page;
        if (params?.limit != null) query.limit = params.limit;

        const { data } = await api.get<{
            tickets: Ticket[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        }>('/tickets', { params: query });
        return data;
    },

    assignAdvisor: async (ticketId: number, advisorId: string) => {
        const { data } = await api.post<{ ticket: Ticket }>(`/tickets/${ticketId}/assign-advisor`, {
            advisorId,
        });
        return data.ticket;
    },

    getById: async (id: number) => {
        const { data } = await api.get<{ ticket: Ticket }>(`/tickets/${id}`);
        return data.ticket;
    },

    create: async (ticketData: CreateTicketData) => {
        const { data } = await api.post<{ ticket: Ticket }>('/tickets', ticketData);
        return data.ticket;
    },

    update: async (id: number | string, ticketData: Partial<CreateTicketData>) => {
        const { data } = await api.patch<{ ticket: Ticket }>(`/tickets/${id}`, ticketData);
        return data.ticket;
    },

    updateStatus: async (id: string, status: string) => {
        const { data } = await api.patch<{ ticket: Ticket }>(`/tickets/${id}`, { status });
        return data.ticket;
    }
};
