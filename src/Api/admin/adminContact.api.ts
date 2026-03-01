import api from '../api';

export interface ContactMessage {
    id: number;
    name: string;
    phone: string;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export const adminContactApi = {
    /**
     * Get all contact messages with optional filter
     */
    getAllMessages: async (params: { page?: number; is_read?: 0 | 1 }) => {
        return api.get('/admin/contact-messages', { params });
    },

    /**
     * Show a single message
     */
    getMessage: async (id: number | string) => {
        return api.get(`/admin/contact-messages/${id}`);
    },

    /**
     * Mark a message as read
     */
    markAsRead: async (id: number | string) => {
        return api.patch(`/admin/contact-messages/${id}/read`);
    },

    /**
     * Delete a message
     */
    deleteMessage: async (id: number | string) => {
        return api.delete(`/admin/contact-messages/${id}`);
    }
};
