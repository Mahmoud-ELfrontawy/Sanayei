import api from "./api";
import { authStorage } from "../context/auth/auth.storage";

const getPrefix = () => {
    const role = authStorage.getUserType();
    if (role === "craftsman") return "/craft/wallet";
    return "/wallet";
};

export interface Transaction {
    id: number;
    amount: number;
    type: "credit" | "debit";
    status: string;
    description: string;
    reference?: string;
    created_at: string;
}

export interface WalletData {
    id: number;
    balance: number;
    currency: string;
}

export interface WalletOverview {
    wallet: WalletData;
    recentTransactions: Transaction[];
}

export interface WithdrawalRequest {
    id: number;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    payout_method: string;
    payout_details: any;
    reason?: string;
    created_at: string;
}

/**
 * Get wallet balance and recent transactions
 */
export const getWalletOverview = async (): Promise<WalletOverview> => {
    const response = await api.get(getPrefix());
    return response.data.data || response.data;
};

/**
 * Get paginated transactions
 */
export const getTransactions = async (params?: any) => {
    const response = await api.get(`${getPrefix()}/transactions`, { params });
    return response.data.data || response.data;
};

/**
 * Initiate adding funds via Paymob
 */
export const addFunds = async (amount: number, method: "card" | "wallet") => {
    const response = await api.post(`${getPrefix()}/add-funds`, { amount, method });
    return response.data;
};

/**
 * Request a withdrawal from the wallet
 */
export const withdraw = async (data: {
    amount: number;
    payout_method: "bank" | "mobile_wallet";
    payout_details: any;
}) => {
    const response = await api.post(`${getPrefix()}/withdraw`, data);
    return response.data;
};

/**
 * Transfer funds to another user by Wallet ID
 */
export const transferFunds = async (data: {
    wallet_id: number;
    amount: number;
    description?: string;
}) => {
    const response = await api.post(`${getPrefix()}/transfer`, data);
    return response.data;
};

/**
 * Get the current user's withdrawal requests
 */
export const getMyWithdrawalRequests = async () => {
    const response = await api.get(`${getPrefix()}/my-requests`);
    return response.data.data || response.data;
};

/**
 * Manually create a wallet for the current user
 */
export const createWallet = async () => {
    const response = await api.post(`${getPrefix()}/create`);
    return response.data.data || response.data;
};
