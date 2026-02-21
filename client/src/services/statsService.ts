import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface TicketStats {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
}

export interface RecentTicket {
    id: number;
    title: string;
    status: string;
    priority: string;
    updatedAt: string;
    client: {
        name: string;
    };
    advisor: {
        name: string;
    } | null;
}

export const statsService = {
    getTicketStats: async (): Promise<TicketStats> => {
        const response = await axios.get(`${API_URL}/stats/tickets`, {
            withCredentials: true,
        });
        return response.data.stats;
    },

    getRecentActivity: async (): Promise<RecentTicket[]> => {
        const response = await axios.get(`${API_URL}/stats/activity`, {
            withCredentials: true,
        });
        return response.data.activity;
    },
};
