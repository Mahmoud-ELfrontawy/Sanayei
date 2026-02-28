import axios from 'axios';
import { authStorage } from '../../context/auth/auth.storage';

const BASE_URL = '/api';

const getAuthHeader = (hasBody = false) => {
    const token = authStorage.getToken();
    const headers: any = { 
        Authorization: `Bearer ${token}`,
        "Accept": "application/json",
    };
    if (hasBody) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
};

export interface WalletFilterParams {
    page?: number;
    type?: 'user' | 'craftsman' | 'company' | 'admin';
    min_balance?: number;
    max_balance?: number;
}

export const adminWalletsApi = {
    // --- Wallet Management ---
    
    /**
     * Get all wallets with optional filtering
     */
    getAllWallets: async (params: WalletFilterParams) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.type) queryParams.append('type', params.type);
        if (params.min_balance) queryParams.append('min_balance', params.min_balance.toString());
        if (params.max_balance) queryParams.append('max_balance', params.max_balance.toString());
        
        return axios.get(`${BASE_URL}/admin/wallets?${queryParams.toString()}`, { headers: getAuthHeader() });
    },

    /**
     * Get single wallet details and transactions
     */
    showWallet: async (walletId: string | number) => {
        return axios.get(`${BASE_URL}/admin/wallets/${walletId}`, { headers: getAuthHeader() });
    },

    /**
     * Add credit manually
     */
    manualCredit: async (walletId: string | number, data: { amount: number; description: string }) => {
        return axios.post(`${BASE_URL}/admin/wallets/${walletId}/credit`, data, { headers: getAuthHeader(true) });
    },

    /**
     * Deduct debit manually
     */
    manualDebit: async (walletId: string | number, data: { amount: number; description: string }) => {
        return axios.post(`${BASE_URL}/admin/wallets/${walletId}/debit`, data, { headers: getAuthHeader(true) });
    },

    // --- Internal Transfers Tracker ---
    
    /**
     * Get global transfers log
     */
    getTransfersTracker: async (params: { page?: number; direction?: 'incoming' | 'outgoing' }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.direction) queryParams.append('direction', params.direction);
        
        return axios.get(`${BASE_URL}/admin/transfers?${queryParams.toString()}`, { headers: getAuthHeader() });
    },

    // --- Withdrawal Requests ---

    /**
     * Get all pending withdrawal requests
     */
    getWithdrawalRequests: async (params: { page?: number; type?: string }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.type) queryParams.append('type', params.type);
        
        return axios.get(`${BASE_URL}/admin/withdrawals?${queryParams.toString()}`, { headers: getAuthHeader() });
    },

    /**
     * Approve a withdrawal request
     */
    approveWithdrawal: async (requestId: string | number) => {
        return axios.post(`${BASE_URL}/admin/withdrawals/${requestId}/approve`, {}, { headers: getAuthHeader(true) });
    },

    /**
     * Reject a withdrawal request
     */
    rejectWithdrawal: async (requestId: string | number, reason: string) => {
        return axios.post(`${BASE_URL}/admin/withdrawals/${requestId}/reject`, { reason }, { headers: getAuthHeader(true) });
    }
};
