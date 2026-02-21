import axios from 'axios';

const API_URL = 'http://localhost:3000/api/appointments';

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
        const response = await axios.get(API_URL, {
            params: { ticketId },
            withCredentials: true
        });
        return response.data.appointments;
    },

    createAppointment: async (data: { date: Date; type: string; ticketId: number; link?: string }) => {
        const response = await axios.post(API_URL, {
            ...data,
            date: data.date.toISOString()
        }, { withCredentials: true });
        return response.data.appointment;
    },

    updateStatus: async (id: number, status: string) => {
        const response = await axios.patch(`${API_URL}/${id}/status`, { status }, { withCredentials: true });
        return response.data.appointment;
    }
};
