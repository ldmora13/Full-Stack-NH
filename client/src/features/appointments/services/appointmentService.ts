import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export interface Appointment {
    id: number;
    date: string;
    type: string;
    status: string;
    link?: string;
    ticketId: number;
    ticket?: {
        title: string;
        client: { name: string };
        advisor?: { name: string };
    };
}

export const AppointmentService = {
    getAppointments: async (ticketId?: number): Promise<Appointment[]> => {
        const response = await axios.get(`${API_URL}/appointments`, {
            params: ticketId ? { ticketId } : {},
            withCredentials: true
        });
        return response.data.appointments ?? [];
    },

    createAppointment: async (data: { date: Date; type: string; ticketId: number; link?: string }) => {
        const response = await axios.post(`${API_URL}/appointments`, {
            ...data,
            date: data.date.toISOString()
        }, { withCredentials: true });
        return response.data.appointment;
    },

    updateStatus: async (id: number, status: string) => {
        const response = await axios.patch(`${API_URL}/appointments/${id}/status`, { status }, { withCredentials: true });
        return response.data.appointment;
    }
};