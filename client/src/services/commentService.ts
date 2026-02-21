import api from '../lib/api';

export interface Comment {
    id: number;
    content: string;
    ticketId: number;
    userId: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        role: 'CLIENT' | 'ADMIN' | 'ADVISOR';
    };
}

export const CommentService = {
    getByTicket: async (ticketId: number) => {
        const { data } = await api.get<{ comments: Comment[] }>(`/tickets/${ticketId}/comments`);
        return data.comments;
    },

    create: async (ticketId: number, content: string) => {
        const { data } = await api.post<{ comment: Comment }>(`/tickets/${ticketId}/comments`, { content });
        return data.comment;
    },
};
