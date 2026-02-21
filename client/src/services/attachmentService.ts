import api from '../lib/api';

export interface Attachment {
    id: number;
    filename: string;
    url: string;
    size: number | null;
    fileType: string | null;
    ticketId: number | null;
    uploaderId: string;
    createdAt: string;
    uploader: {
        id: string;
        name: string;
        role: 'CLIENT' | 'ADMIN' | 'ADVISOR';
    };
}



export const AttachmentService = {
    getByTicket: async (ticketId: number) => {
        const { data } = await api.get<{ attachments: Attachment[] }>(`/tickets/${ticketId}/attachments`);
        return data.attachments;
    },

    upload: async (ticketId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post<{ attachment: Attachment }>(`/tickets/${ticketId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data.attachment;
    },
};
