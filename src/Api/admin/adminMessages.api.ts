import axios from 'axios';
import { authStorage } from '../../context/auth/auth.storage';

const BASE_URL = '/api';

const getAuthHeader = (hasBody = false) => {
    const token = authStorage.getToken();
    const headers: any = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    };
    if (hasBody) headers['Content-Type'] = 'application/json';
    return headers;
};

export interface AdminMessageItem {
    id: number;
    admin_id: number;
    type: 'broadcast' | 'individual';
    target_type: string;
    target_id: number | null;
    title: string;
    body: string;
    created_at: string;
    admin?: { id: number; name: string };
}

export interface SendBroadcastPayload {
    target_type: 'all' | 'users' | 'craftsmen' | 'companies';
    title: string;
    body: string;
}

export interface SendIndividualPayload {
    target_type: 'user' | 'craftsman' | 'company';
    target_id: number;
    title: string;
    body: string;
}

export const adminMessagesApi = {
    /** List all sent admin messages */
    getAll: (type?: 'broadcast' | 'individual', page = 1) => {
        const params = new URLSearchParams({ page: String(page) });
        if (type) params.append('type', type);
        return axios.get(`${BASE_URL}/admin/messages?${params}`, { headers: getAuthHeader() });
    },

    /** Search recipients (for individual-send autocomplete) */
    searchRecipients: (type: 'user' | 'craftsman' | 'company', q: string) =>
        axios.get(`${BASE_URL}/admin/messages/search`, {
            headers: getAuthHeader(),
            params: { type, q },
        }),

    /** Send broadcast to a group */
    sendBroadcast: (payload: SendBroadcastPayload) =>
        axios.post(`${BASE_URL}/admin/messages/broadcast`, payload, { headers: getAuthHeader(true) }),

    /** Send individual message to one person */
    sendIndividual: (payload: SendIndividualPayload) =>
        axios.post(`${BASE_URL}/admin/messages/individual`, payload, { headers: getAuthHeader(true) }),
};
