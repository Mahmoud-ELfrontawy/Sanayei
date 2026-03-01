import api from '../api';

// The shared 'api' instance already handles the Authorization header and baseURL.

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
        return api.get('/admin/wallets', { params });
    },

    /**
     * Get single wallet details and transactions
     */
    showWallet: async (walletId: string | number) => {
        return api.get(`/admin/wallets/${walletId}`);
    },

    /**
     * Add credit manually
     */
    manualCredit: async (walletId: string | number, data: { amount: number; description: string }) => {
        return api.post(`/admin/wallets/${walletId}/credit`, data);
    },

    /**
     * Deduct debit manually
     */
    manualDebit: async (walletId: string | number, data: { amount: number; description: string }) => {
        return api.post(`/admin/wallets/${walletId}/debit`, data);
    },

    // --- Internal Transfers Tracker ---
    
    /**
     * Get global transfers log
     */
    getTransfersTracker: async (params: { page?: number; direction?: 'incoming' | 'outgoing' }) => {
        return api.get('/admin/transfers', { params });
    },

    // --- Withdrawal Requests ---

    /**
     * Get all pending withdrawal requests
     */
    getWithdrawalRequests: async (params: { page?: number; type?: string }) => {
        return api.get('/admin/withdrawals', { params });
    },

    /**
     * Approve a withdrawal request
     */
    approveWithdrawal: async (requestId: string | number) => {
        return api.post(`/admin/withdrawals/${requestId}/approve`);
    },

    /**
     * Reject a withdrawal request
     */
    rejectWithdrawal: async (requestId: string | number, reason: string) => {
        return api.post(`/admin/withdrawals/${requestId}/reject`, { reason });
    }
};
